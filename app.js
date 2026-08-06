const connectBtn = document.getElementById('connectBtn');
const sendBtn = document.getElementById('sendBtn');
const statusText = document.getElementById('status');
const appSection = document.getElementById('appSection');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

let signer;
const MY_ADDRESS = "0x28c8BC8e084C14ff404FCd2b82338BDcc2e5D03e";

const ARC_CHAIN = {
    chainId: '0x1F8', 
    chainName: 'Arc Testnet',
    nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app']
};

async function ensureArcNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_CHAIN.chainId }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [ARC_CHAIN],
            });
        }
    }
}

connectBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await ensureArcNetwork();
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            connectBtn.style.display = "none";
            appSection.style.display = "block";
            statusText.innerText = "Bağlandı! Mesajını yazabilirsin.";
        } catch (err) {
            statusText.innerText = "Bağlantı reddedildi.";
        }
    } else {
        statusText.innerText = "Lütfen MetaMask yükleyin.";
    }
});

sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    try {
        await ensureArcNetwork();
        statusText.innerText = "Cüzdandan onay bekleniyor...";
        
        // Girdiğin yazıyı blockchain'in anlayacağı Hex (onaltılık) formata çeviriyoruz
        const hexMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));

        // 0 ARC göndererek sadece veri (data) transferi yapıyoruz
        const tx = await signer.sendTransaction({
            to: MY_ADDRESS, 
            value: 0, 
            data: hexMessage 
        });

        statusText.innerText = "İşlem ağa gönderildi. Onaylanıyor...";
        await tx.wait();

        statusText.innerText = "✅ Başarılı! Mesajın Arc Testnet'e kazındı.";
        messagesDiv.innerHTML += `<p>📝 ${text}</p>`;
        messageInput.value = "";
    } catch (err) {
        statusText.innerText = "Hata: " + (err.reason || err.message || "İşlem iptal edildi.");
        console.error(err);
    }
});
