import { t } from "$lib/trpc/t";

import { z } from "zod";

const { HELIUS_KEY } = process.env;

// TODO: add output validation once this merges with the token endpoint
export const asset = t.procedure.input(z.string()).query(async ({ input }) => {
    const url = `https://mainnet-beta.solanarpc.network/?api-key=${HELIUS_KEY}`;

    const response = await fetch(url, {
        body: JSON.stringify({
            id: "asset",
            jsonrpc: "2.0",
            method: "getAsset",
            params: [input],
        }),
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
    });

    const data = await response.json();
    let metadata = {
        address: "",
        attributes: [],
        collectionKey: "",
        compressed: false,
        sellerFeeBasisPoints: 0,
        creators: [],
        description: "",
        image: "",
        name: "",
    };

    if (data?.result?.compression?.compressed === true) {
        const assetData = await fetch(data.result.content.json_uri);
        const returnAssetData = await assetData.json();

        metadata = {
            address: data?.result?.id || "",
            attributes: returnAssetData?.attributes || [],
            collectionKey: data?.result?.grouping[0]?.group_value || "",
            compressed: true,
            sellerFeeBasisPoints: data?.result?.sellerFeeBasisPoints || 0,
            creators: data?.result?.creators || [],
            description: returnAssetData?.description || "",
            image: returnAssetData?.image || "",
            name: returnAssetData?.name || "",
        };
    }
    return metadata;
});
