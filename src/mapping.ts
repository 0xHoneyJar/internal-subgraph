import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { QueueBoost as QueueBoostEvent } from "../generated/IBGT/IBGT";
import { QueueBoost, THJValidator } from "../generated/schema";

const THJ_VALIDATOR = "0x40495A781095932e2FC8dccA69F5e358711Fdd41";

function createEventID(event: ethereum.Event): string {
  return event.block.number
    .toString()
    .concat("-")
    .concat(event.logIndex.toString());
}

export function handleQueueBoost(event: QueueBoostEvent): void {
  let id = createEventID(event);
  let queueBoost = new QueueBoost(id);

  queueBoost.validator = event.params.validator.toHexString();
  queueBoost.amount = event.params.amount;
  queueBoost.sender = event.params.sender.toHexString();
  queueBoost.blockTime = event.block.timestamp;
  queueBoost.blockNumber = event.block.number;

  queueBoost.save();

  // Handle THJValidator logic
  if (event.params.validator.toHexString() == THJ_VALIDATOR) {
    let senderId = event.params.sender.toHexString();
    let thjValidator = THJValidator.load(senderId);
    if (thjValidator == null) {
      thjValidator = new THJValidator(senderId);
      thjValidator.amount = BigInt.fromI32(0);
    }
    thjValidator.amount = thjValidator.amount.plus(event.params.amount);
    thjValidator.save();
  }
}

// export function handleDelegation(event: DelegationEvent): void {
//   let id = createEventID(event)
//   let delegation = new Delegation(id)

//   delegation.amount = event.params.amount

//   delegation.save()
// }

// export function handleEventToken(ev: EventTokenEvent): void
// {
//   let event = Event.load(ev.params.eventId.toString());
//   // This handler always run after the transfer handler
//   let token = Token.load(ev.params.tokenId.toString())!;
//   if (event == null) {
//     event               = new Event(ev.params.eventId.toString());
//     event.tokenCount    = BigInt.fromI32(0);
//     event.tokenMints    = BigInt.fromI32(0);
//     event.transferCount = BigInt.fromI32(0);
//     event.created       = ev.block.timestamp
//   }

//   event.tokenCount    += BigInt.fromI32(1);
//   event.tokenMints    += BigInt.fromI32(1);
//   event.transferCount += BigInt.fromI32(1);
//   token.event         = event.id;
//   token.mintOrder     = event.tokenMints;
//   event.save();
//   token.save();
// }

// export function handleTransfer(ev: TransferEvent): void {
//   let token    = Token.load(ev.params.tokenId.toString());
//   let from     = Account.load(ev.params.from.toHex());
//   let to       = Account.load(ev.params.to.toHex());
//   let transfer = new Transfer(createEventID(ev));

//   if (from == null) {
//     from              = new Account(ev.params.from.toHex());
//     // The from account at least has to own one token
//     from.tokensOwned  = BigInt.fromI32(1);
//   }
//   // Don't subtracts from the ZERO_ADDRESS (it's the one that mint the token)
//   // Avoid negative values
//   if(from.id != ZERO_ADDRESS) {
//     from.tokensOwned -= BigInt.fromI32(1);
//   }
//   from.save();

//   if (to == null) {
//     to              = new Account(ev.params.to.toHex());
//     to.tokensOwned  = BigInt.fromI32(0);
//   }
//   to.tokensOwned += BigInt.fromI32(1);
//   to.save();

//   if (token == null) {
//     token               = new Token(ev.params.tokenId.toString());
//     token.transferCount = BigInt.fromI32(0);
//     token.created       = ev.block.timestamp
//   }
//   token.owner = to.id;
//   token.transferCount += BigInt.fromI32(1);
//   token.save();

//   if (token.event != null) {
//     let event = Event.load(token.event as string);

//     if(event != null) {
//       // Add one transfer
//       event.transferCount += BigInt.fromI32(1);

//       // Burning the token
//       if(to.id == ZERO_ADDRESS) {
//         event.tokenCount    -= BigInt.fromI32(1);
//         // Subtract all the transfers from the burned token
//         event.transferCount -= token.transferCount;
//       }
//       event.save();
//     }
//   }

//   transfer.token       = token.id;
//   transfer.from        = from.id;
//   transfer.to          = to.id;
//   transfer.transaction = ev.transaction.hash;
//   transfer.timestamp   = ev.block.timestamp;
//   transfer.save();
// }