import * as anchor from "@coral-xyz/anchor";
import * as ff from "ffjavascript";
import { poseidonHash, toHex } from "./utils";

const NOTE_IDENTITIFER = "hush";

export interface IDeposit {
  pool: anchor.web3.PublicKey;
  nullifier: bigint;
  secret: bigint;
  preimage: Uint8Array;
  commitmentHash: Uint8Array;
  nullifierHash: Uint8Array;
}

export default class Deposit {
  static async create(
    pool: anchor.web3.PublicKey,
    nullifier: bigint,
    secret: bigint
  ): Promise<IDeposit> {
    const nullifierBuff = ff.utils.leInt2Buff(nullifier, 31);
    const secretBuff = ff.utils.leInt2Buff(secret, 31);
    const preimage = new Uint8Array(Buffer.concat([nullifierBuff, secretBuff]));
    const commitmentHash = await poseidonHash([nullifier, secret]);
    const nullifierHash = await poseidonHash([nullifier]);
    return {
      pool,
      nullifier,
      secret,
      preimage,
      commitmentHash,
      nullifierHash,
    };
  }

  static generateNote(deposit: IDeposit): string {
    return `${NOTE_IDENTITIFER}-${deposit.pool.toString()}-${toHex(
      deposit.preimage,
      62
    )}`;
  }

  static async parseNote(note: string): Promise<IDeposit> {
    const [identifier, pool, preimage] = note.split("-");
    if (identifier !== NOTE_IDENTITIFER) {
      throw new Error("invalid note");
    }
    const poolPublicKey = new anchor.web3.PublicKey(pool);
    const preImageBuff = new Uint8Array(Buffer.from(preimage, "hex"));
    const nullifierBuff = preImageBuff.slice(0, 31);
    const secretBuff = preImageBuff.slice(31, 62);
    const nullifier = ff.utils.leBuff2int(nullifierBuff);
    const secret = ff.utils.leBuff2int(secretBuff);
    return Deposit.create(poolPublicKey, nullifier, secret);
  }
}
