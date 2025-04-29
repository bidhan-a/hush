/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/hush.json`.
 */
export type Hush = {
  address: "CkevGEmkCSpN3SgS9ptG42qL42vV4aTS8NrhDx29sxF3";
  metadata: {
    name: "hush";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "createPool";
      discriminator: [233, 146, 209, 142, 207, 104, 64, 188];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "arg";
                path: "amount";
              }
            ];
          };
        },
        {
          name: "vault";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "deposit";
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182];
      accounts: [
        {
          name: "depositor";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "arg";
                path: "amount";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "lastDeposit";
          writable: true;
          optional: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [100, 101, 112, 111, 115, 105, 116];
              },
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "account";
                path: "pool.last_commitment.unwrap_or([0u8; 32])";
                account: "poolState";
              }
            ];
          };
        },
        {
          name: "deposit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [100, 101, 112, 111, 115, 105, 116];
              },
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "arg";
                path: "commitment";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "commitment";
          type: {
            array: ["u8", 32];
          };
        }
      ];
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "feeBasisPoints";
          type: "u16";
        }
      ];
    },
    {
      name: "withdraw";
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: "withdrawer";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "pool";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "arg";
                path: "amount";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "pool";
              }
            ];
          };
        },
        {
          name: "withdraw";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [119, 105, 116, 104, 100, 114, 97, 119];
              },
              {
                kind: "account";
                path: "pool";
              },
              {
                kind: "arg";
                path: "nullifierHash";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "nullifierHash";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "root";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "proof";
          type: {
            array: ["u8", 256];
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "configState";
      discriminator: [193, 77, 160, 128, 208, 254, 180, 135];
    },
    {
      name: "depositState";
      discriminator: [203, 5, 16, 65, 63, 206, 55, 194];
    },
    {
      name: "poolState";
      discriminator: [247, 237, 227, 245, 215, 195, 222, 70];
    },
    {
      name: "withdrawState";
      discriminator: [0, 100, 49, 210, 162, 175, 95, 214];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "permissionDenied";
      msg: "Permission denied.";
    },
    {
      code: 6001;
      name: "merkleTreeFull";
      msg: "Merkle tree is full.";
    },
    {
      code: 6002;
      name: "invalidMerkleRoot";
      msg: "Merkle root is invalid.";
    },
    {
      code: 6003;
      name: "insufficientFunds";
      msg: "Insufficient funds for deposit.";
    },
    {
      code: 6004;
      name: "invalidDeposit";
      msg: "The deposit is invalid.";
    },
    {
      code: 6005;
      name: "nullifierAlreadyUsed";
      msg: "Nullier has already been used.";
    },
    {
      code: 6006;
      name: "invalidProof";
      msg: "The proof is invalid.";
    },
    {
      code: 6007;
      name: "verificationError";
      msg: "The proof could not be verified.";
    }
  ];
  types: [
    {
      name: "configState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "feeBasisPoints";
            type: "u16";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "depositState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "from";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "commitment";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "siblingCommitment";
            type: {
              option: {
                array: ["u8", 32];
              };
            };
          },
          {
            name: "index";
            type: "u32";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "poolState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "nextIndex";
            type: "u32";
          },
          {
            name: "merkleRoots";
            type: {
              array: [
                {
                  array: ["u8", 32];
                },
                30
              ];
            };
          },
          {
            name: "currentMerkleRootIndex";
            type: "u8";
          },
          {
            name: "filledSubtrees";
            type: {
              array: [
                {
                  array: ["u8", 32];
                },
                20
              ];
            };
          },
          {
            name: "lastCommitment";
            type: {
              option: {
                array: ["u8", 32];
              };
            };
          },
          {
            name: "poolBump";
            type: "u8";
          },
          {
            name: "vaultBump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "withdrawState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pool";
            type: "pubkey";
          },
          {
            name: "to";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "nullifierHash";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
};
