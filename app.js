const connectBtn = document.getElementById('connectBtn');
const sendBtn = document.getElementById('sendBtn');
const statusText = document.getElementById('status');
const appSection = document.getElementById('appSection');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');
const balanceDisplay = document.getElementById('balanceDisplay');

let signer;
let userAddress;

// Ölü cüzdan (Burn Address) - Paralar buraya gider ve yok olur
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const BURN_AMOUNT = "0.0001"; // İşlem başına yakılacak sembolik miktar

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

async function updateBalance(provider, address) {
    try {
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.utils.formatEther(balanceWei);
        balanceDisplay.innerText = `ARC Bakiyesi: ${parseFloat(balanceEth).toFixed(4)} ARC`;
    } catch (err) {
        console.error("Bakiye okunamadı:", err);
    }
}

connectBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await ensureArcNetwork();
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            connectBtn.style.display = "none";
            appSection.style.display = "block";
            statusText.innerText = "Bağlandı! Mesajını yazabilirsin.";
            
            await updateBalance(provider, userAddress);
        } catch (err) {
            statusText.innerText = "Bağlantı reddedildi.";
        }
    } else {
        statusText.innerText = "Lütfen cüzdan yükleyin.";
    }
});

sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    try {
        await ensureArcNetwork();
        statusText.innerText = "Cüzdandan onay bekleniyor...";
        
        const hexMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));

        // ARC yakarak (burn) ve mesajı dataya ekleyerek işlem gönderiyoruz
        const tx = await signer.sendTransaction({
            to: BURN_ADDRESS, 
            value: ethers.utils.parseEther(BURN_AMOUNT), 
            data: hexMessage 
        });

        statusText.innerText = "İşlem ağa gönderildi. Onaylanıyor...";
        await tx.wait();

        statusText.innerText = "✅ Başarılı! ARC yakıldı ve mesajın Arc Testnet'e kazındı.";
        messagesDiv.innerHTML += `<p>🔥📝 ${text}</p>`;
        messageInput.value = "";
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await updateBalance(provider, userAddress);
    } catch (err) {
        statusText.innerText = "Hata: " + (err.reason || err.message || "İşlem iptal edildi.");
        console.error(err);
    }
});
