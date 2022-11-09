// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
import kusamaParachains from './kusama-parachains.json' assert { type: "json" };
import polkadotParachains from './polkadot-parachains.json' assert { type: "json" };
import rococoParachains from './rococo-parachains.json' assert { type: "json" };

// Construct
// const wsProviderPolkadot = new WsProvider('wss://rpc.polkadot.io');
// const polkadotApi = await ApiPromise.create({ provider: wsProviderPolkadot });

// const wsProviderKusama = new WsProvider('wss://kusama-rpc.polkadot.io');
// const kusamaApi = await ApiPromise.create({ provider: wsProviderKusama });

const wsProviderRococo = new WsProvider('wss://rococo-rpc.polkadot.io');
const rococoApi = await ApiPromise.create({ provider: wsProviderRococo });

async function main () {
    
    //First read what are the active parachains on each relay chain.
    //This helps understand what teams have an active parachain that needs a long-lasting slot on Rococo.
    
    // // Polkadot
    // const polkadotParas = await (await polkadotApi.query.paras.parachains()).toHuman();
    
    // //Kusama
    // const kusamaParas = await (await kusamaApi.query.paras.parachains()).toHuman();
    
    //Rococo
    const rococoParas = await (await rococoApi.query.paras.parachains()).toHuman();
    
    //For Rococo, need to know which ones are from long-lasting slots and which ones from short-term leases
    const allLongLastingRococo = await rococoApi.query.assignedSlots.permanentSlots.entries();
    const shortTermRococo = await rococoApi.query.assignedSlots.temporarySlots.entries();

    const longLastingNonParachain = [];
    const longLastingRococo = [];
    const shortLastingNonParachain = [];
    const shortLastingRococo = [];

    allLongLastingRococo.forEach(([{ args: [paraID] }, value]) => {
        const humanParaID = paraID.toHuman();
        //first we create the list of paraIDs that have a longlasting slot
        longLastingRococo.push(humanParaID);
        //then check if a longlasting paraID is not a parachain
        if (!rococoParas.includes(humanParaID)){
            longLastingNonParachain.push(humanParaID);
        }
    });

    shortTermRococo.forEach(([{ args: [paraID] }, value]) => {
        const humanParaID = paraID.toHuman();
        //first we create the list of paraIDs that have a longlasting slot
        shortLastingRococo.push(humanParaID);
        //then check if a longlasting paraID is not a parachain
        if (!rococoParas.includes(humanParaID)){
            shortLastingNonParachain.push(humanParaID);
        }
    });

    // No parachain should be in this situation.

    const unnassginedParas = rococoParas.reduce((parasArray,para) => {
        if (!longLastingRococo.includes(para)  && !shortTermRococo.includes(para)){
            parasArray.push(para)
        }
        return parasArray;
    },[])

    // Printing Rococo Information
    // TODO: Maybe add human-readable names once instead of for each print. Still no much need for this code to be ultra performant.
    console.log("*** Rococo's Parachains Status ***");
    console.log("**** Long Lasting Slots ****")
    console.log("Parachains with Long-Lasting Slots assigned");
    //list of long-lasting parachains on Rococo longLastingRococo
    console.log(addNames("r",longLastingRococo));
    console.log("Parachains with Long-Lasting Slots assigned that are not connected as Parachains");
    console.error("This should not happen");
    //list of long-lasting parachains on Rococo that are not parachains longLastingNonParachain
    console.log(addNames("r",longLastingNonParachain));
    console.log("**** Short Lasting Slots ****");
    console.log("5 temp slots per period; max wait (days) ->", Math.ceil((shortLastingRococo.length/5-1)*3));
    console.log("Parachains with Short-Lasting Slots assigned");
    //list of short-lasting parachains on Rococo shortLastingRococo
    console.log(addNames("r",shortLastingRococo));
    console.log("Parachains with Short-Lasting Slots assigned that are not connected as Parachains");
    //list of short-lasting parachains on Rococo that are not parachains shortLastingNonParachain
    console.log(addNames("r",shortLastingNonParachain));
    console.log("**** Unassigned Parachains ****");
    console.warn("This should only happen with common good slots - 1xxx");
    console.log(unnassginedParas.length, "Unassigned Paras")
    //parachains on Rococo that are not connected using the assigned_slots pallet -> unnassginedParas
    console.log(addNames("r",unnassginedParas));

    // Now check how parachains are interacting with Rococo
    // TODO: how to actively keep track of parachains that are from the same team: Karura/Acala for example.
    // TODO: cases -> team has paras on kusama and polkadot; team has only on kusama; team has only on polkadot

    // const polkadotParaLongTermSlot = [];
    // const polkadotParaShortTermSlot = [];
    // const polkadotParaUnassaginedSlotType = [];
    // const polkadotParaNotInRococo = [];

    // const kusamaParaLongTermSlot = [];
    // const kusamaParaShortTermSlot = [];
    // const kusamaParaUnassaginedSlotType = [];
    // const kusamaParaNotInRococo = [];

    // //Check Polkadot

    // polkadotParas.map((paraID) => {
    //     if (longLastingRococo.includes(paraID)){
    //         polkadotParaLongTermSlot.push(paraID)
    //     } else if (shortTermRococo.includes(paraID)){
    //         polkadotParaShortTermSlot.push(paraID)
    //     } else if (rococoParas.includes(paraID)) {
    //         polkadotParaUnassaginedSlotType.push(paraID)
    //     } else {
    //         polkadotParaNotInRococo.push(paraID)
    //     }
    // })

    // //Check Kusama

    // kusamaParas.map((paraID) => {
    //     if (longLastingRococo.includes(paraID)){
    //         kusamaParaLongTermSlot.push(paraID)
    //     } else if (shortTermRococo.includes(paraID)){
    //         kusamaParaShortTermSlot.push(paraID)
    //     } else if (rococoParas.includes(paraID)) {
    //         kusamaParaUnassaginedSlotType.push(paraID)
    //     } else {
    //         kusamaParaNotInRococo.push(paraID)
    //     }
    // })

    // console.log("unnasignedRococoParas -> ",unnasignedRococoParas.length, "->", unnasignedRococoParas);
    // console.log("polkadot on Rococo", polkadotParasOnRococo)
    // console.log("kusama on Rococo", kusamaParasOnRococo)

    // console.log("polkadotParaLongTermSlot",polkadotParaLongTermSlot)
    // console.log("polkadotParaShortTermSlot",polkadotParaShortTermSlot)
    // console.log("polkadotParaUnassaginedSlotType",polkadotParaUnassaginedSlotType)
    // console.log("polkadotParaNotInRococo",polkadotParaNotInRococo)
    // console.log("kusamaParaLongTermSlot",kusamaParaLongTermSlot)
    // console.log("kusamaParaShortTermSlot",kusamaParaShortTermSlot)
    // console.log("kusamaParaUnassaginedSlotType",kusamaParaUnassaginedSlotType)
    // console.log("kusamaParaNotInRococo",kusamaParaNotInRococo)
}

//helper function - add names
const addNames = (chain,list) => {
    let names;
    const newArray = [];
    
    switch (chain) {
        case "r":
            names = rococoParachains;
            break;
        case "p":
            names = polkadotParachains;
            break;
        case "k":
            names = kusamaParachains;
            break;
    }  

    list.forEach((v,i) => {
        //name already returns an object with ID and name, however some don't have a name
        let name = names.filter((_v,_i) => _v.id === v.split(",").join(""));
        name = name.length ? name[0].name : "";

        newArray.push({
            "id": v,
            name
        })
    })

    return newArray;
}




main().catch(console.error).finally(() => process.exit());