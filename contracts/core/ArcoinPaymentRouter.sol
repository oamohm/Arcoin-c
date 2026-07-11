// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  ArcoinPaymentRouter
 * @notice Single entry point for all USDC payments in Arcoin.
 *
 * @dev    Every payment goes through here:
 *         1. OFAC check (via blocklist)
 *         2. Fee calculation (0.1% → Treasury)
 *         3. Net transfer to recipient
 *         4. Event emission (for Blockscout indexing)
 *
 *         This contract NEVER holds funds. It routes them.
 *         If this contract is paused, direct ERC-20 transfer still works
 *         (Arc USDC is always accessible). This eliminates payment SPOF.
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IArcoinTreasury {
    function collectFee(uint256 amount, string calldata feeType) external;
    function calculateFee(uint256 amount) external pure returns (uint256);
}

contract ArcoinPaymentRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── CONSTANTS ─────────────────────────────────────────────
    uint256 public constant MAX_NOTE_LENGTH = 128;

    // ── STATE ──────────────────────────────────────────────────
    IERC20           public immutable usdc;
    IArcoinTreasury  public immutable treasury;

    // OFAC / sanctions blocklist (Phase 1: manual, Phase 3: Chainalysis)
    mapping(address => bool) public blocked;

    bool    public paused;
    uint256 public totalRoutedAmount;
    uint256 public totalTransactionCount;

    // ── EVENTS ────────────────────────────────────────────────
    /**
     * @dev Structured event for Blockscout indexing.
     *      Frontend reads this to show tx history.
     */
    event PaymentRouted(
        address indexed sender,
        address indexed recipient,
        uint256         amount,         // net (after fee)
        uint256         fee,            // protocol fee
        bytes32         noteHash,       // keccak256 of note, for privacy
        uint256         timestamp
    );

    event AddressBlocked(address indexed account, bool blocked);
    event RouterPaused(bool paused);

    // ── ERRORS ────────────────────────────────────────────────
    error Paused();
    error SenderBlocked();
    error RecipientBlocked();
    error ZeroAmount();
    error SelfTransfer();
    error NoteTooLong();
    error InsufficientAmount();  // after fee, recipient would get 0

    // ── CONSTRUCTOR ───────────────────────────────────────────
    constructor(
        address _usdc,
        address _treasury,
        address _owner
    ) Ownable(_owner) {
        usdc     = IERC20(_usdc);
        treasury = IArcoinTreasury(_treasury);
    }

    // ─────────────────────────────────────────────────────────
    // CORE: ROUTE PAYMENT
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Route a USDC payment with protocol fee.
     *
     * @param  recipient  Destination address
     * @param  amount     Total amount (including fee) in USDC (6 decimals)
     * @param  note       Optional payment note (max 128 chars, stored as hash)
     *
     * @dev    Caller must approve this contract for `amount` USDC first.
     *         Net received by recipient = amount - fee (0.1%)
     */
    function routePayment(
        address         recipient,
        uint256         amount,
        string calldata note
    ) external nonReentrant {
        if (paused)                     revert Paused();
        if (blocked[msg.sender])        revert SenderBlocked();
        if (blocked[recipient])         revert RecipientBlocked();
        if (amount == 0)                revert ZeroAmount();
        if (recipient == msg.sender)    revert SelfTransfer();
        if (bytes(note).length > MAX_NOTE_LENGTH) revert NoteTooLong();

        // Calculate fee
        uint256 fee    = treasury.calculateFee(amount);
        uint256 net    = amount - fee;
        if (net == 0) revert InsufficientAmount();

        // Pull full amount from sender
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Forward fee to Treasury
        if (fee > 0) {
            usdc.safeApprove(address(treasury), fee);
            treasury.collectFee(fee, "payment");
        }

        // Send net amount to recipient
        usdc.safeTransfer(recipient, net);

        // Update stats
        totalRoutedAmount      += net;
        totalTransactionCount  += 1;

        emit PaymentRouted(
            msg.sender,
            recipient,
            net,
            fee,
            bytes(note).length > 0 ? keccak256(bytes(note)) : bytes32(0),
            block.timestamp
        );
    }

    /**
     * @notice Zero-fee direct transfer (bypasses router fee).
     *         Used for refunds, internal ops, admin transfers.
     *         Only callable by approved addresses.
     */
    function directTransfer(
        address recipient,
        uint256 amount
    ) external nonReentrant onlyOwner {
        usdc.safeTransferFrom(msg.sender, recipient, amount);
    }

    // ─────────────────────────────────────────────────────────
    // VIEW
    // ─────────────────────────────────────────────────────────

    function previewFee(uint256 amount) external view returns (
        uint256 fee,
        uint256 netAmount
    ) {
        fee       = treasury.calculateFee(amount);
        netAmount = amount - fee;
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────

    function setBlocked(address account, bool _blocked) external onlyOwner {
        blocked[account] = _blocked;
        emit AddressBlocked(account, _blocked);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit RouterPaused(_paused);
    }
}


