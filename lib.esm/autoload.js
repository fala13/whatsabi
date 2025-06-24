#!/usr/bin/env -S tsx
import { ethers } from "ethers";
import { whatsabi } from "./index.js";
const provider = new ethers.IpcSocketProvider("/srv/black/reth/reth.ipc");
/*const env = {
    INFURA_API_KEY: process.env.INFURA_API_KEY,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    PROVIDER: provider,
    //PROVIDER: process.env.PROVIDER,
    NETWORK: process.env.NETWORK,
};*/
//const provider = env.INFURA_API_KEY ? (new ethers.InfuraProvider("homestead", env.INFURA_API_KEY)) : ethers.getDefaultProvider(env.NETWORK || "homestead");
//const provider = new ethers.providers.IpcProvider("/srv/black/reth/reth.ipc");
// Helper
// https://stackoverflow.com/questions/11731072/dividing-an-array-by-filter-function 
/*const partitionBy = <T>(
  arr: T[],
  predicate: (v: T, i: number, ar: T[]) => boolean
) =>
  arr.reduce(
    (acc, item, index, array) => {
      acc[+!predicate(item, index, array)].push(item);
      return acc;
    },
    [[], []] as [T[], T[]]
  );
*/
async function main() {
    const address = process.env["ADDRESS"] || process.argv[2];
    if (!address) {
        console.log("Usage: autoload.ts ADDRESS");
        process.exit(1);
    }
    //const result = await whatsabi.autoload(address, { provider });
    //console.log(result.abi);
    // const code = await provider.getCode(address); 
    //    console.log(code);
    //const code = "0x6080604052600436101561001b575b361561001957600080fd5b005b6000803560e01c63ebe4107c14610032575061000e565b60407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126100d25760043573ffffffffffffffffffffffffffffffffffffffff811681036100d55760243567ffffffffffffffff928382116100d257366023830112156100d25781600401359384116100d2573660248560051b840101116100d25760406100c6856024850186610149565b82519182526020820152f35b80fd5b5080fd5b90601f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0910116810190811067ffffffffffffffff82111761011a57604052565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b92919060005b8281106103ae5750505073ffffffffffffffffffffffffffffffffffffffff809216916040908151917f70a082310000000000000000000000000000000000000000000000000000000083523060048401526020948584602481845afa9384156103a357600094610374575b50479584158015809161036b575b1561030e57610266575b50508480158015610213575b5050507f0000000000000000000000000000000009ae004a920069b8e1a189b82403a13016330361020e579190565b600080fd5b60009061025d575b60008080938193877f0000000000000000000000000000000009ae004a920069b8e1a189b82403a1301690f1156102535784816101df565b513d6000823e3d90fd5b506108fc61021b565b8060009260448551809581937fa9059cbb000000000000000000000000000000000000000000000000000000008352897f0000000000000000000000000000000009ae004a920069b8e1a189b82403a1301660048401528a60248401525af1801561030357156101d35781813d83116102fc575b6102e481836100d9565b8101031261020e57518015150361020e5738806101d3565b503d6102da565b83513d6000823e3d90fd5b6064828551907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152600560248201527f73706963650000000000000000000000000000000000000000000000000000006044820152fd5b508715156101c9565b90938682813d831161039c575b61038b81836100d9565b810103126100d257505192386101bb565b503d610381565b82513d6000823e3d90fd5b8060051b8201357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc18336030181121561020e578201803573ffffffffffffffffffffffffffffffffffffffff8116810361020e5760209182810135907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe18136030182121561020e57019081359067ffffffffffffffff9283831161020e57840191803603831361020e576000918291826040958287519384928337810182815203925af1923d156104d8573d92831161011a5760009151926104b7827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f84011601856100d9565b83523d92013e5b156104cb5760010161014f565b5050509050600090600090565b5050506104be56fea164736f6c6343000813000a";
    // const selectors = whatsabi.selectorsFromBytecode(code);
    // console.log(selectors);
    // const abi = whatsabi.abiFromBytecode(code);
    //console.log(abi);
    // console.log(JSON.stringify(abi, null, 2));
    //     if (r.followProxies) {
    // 	r = await r.followProxies();
    // }
    // process.exit(0);
    let r = await whatsabi.autoload(address, {
        provider,
        // onProgress: (phase: string, ...args: string[]) => {
        //     console.debug("progress:", phase, ...args);
        // },
        // ... whatsabi.loaders.defaultsWithEnv(env),
    });
    console.log(r.abi);
    console.log(JSON.stringify(r.abi, null, 2));
    //while (true) {
    /*
        const [abi, unresolved] = partitionBy(r.abi, a => (a.type !== "function" || "name" in a));
        const iface = new ethers.Interface(abi);
        console.log("autoload", iface.format());
        if (unresolved) console.log("unresolved", unresolved);

        //if (!r.followProxies) break;

        console.log("following proxies...");
        r = await r.followProxies();
    //}
    */
    process.exit(0);
}
main().then().catch(err => {
    console.error("Failed:", err);
    process.exit(2);
});
//# sourceMappingURL=autoload.js.map