const connectBtn = document.getElementById('connectBtn');
const mintBtn = document.getElementById('mintBtn');
const statusText = document.getElementById('status');
const mintedCountEl = document.getElementById('mintedCount');

let signer;
let mintedCount = 142;
const MINT_PRICE = "0.001"; 
const MY_ADDRESS = "0x28c8BC8e084C14ff404FCd2b82338BDcc2e5D03e"; 

// Arc Testnet Ağ Parametreleri
const ARC_CHAIN = {
    chainId: '0x1F8', // Hexadecimal format (504)
    chainName: 'Arc Testnet',
    nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app']
};

// MetaMask'ı Otomatik Arc Testnet Ağını Seçmeye Zorlama Fonksiyonu
async function ensureArcNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARC_CHAIN.chainId }],
        });
    } catch (switchError) {
        // Eğer ağ MetaMask'te daha önce eklenmemişse otomatik ekler
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
            statusText.innerText = "Arc Testnet ağına bağlanılıyor...";
            await ensureArcNetwork(); // Otomatik olarak Arc ağına geçirir

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            connectBtn.style.display = "none";
            mintBtn.style.display = "block";
            statusText.innerText = "Arc Testnet ağına bağlandınız! Mint yapabilirsiniz.";
        } catch (err) {
            statusText.innerText = "Bağlantı veya ağ değişimi reddedildi.";
            console.error(err);
        }
    } else {
        statusText.innerText = "Lütfen MetaMask yükleyin.";
    }
});

mintBtn.addEventListener('click', async () => {
    try {
        await ensureArcNetwork(); // Mint öncesi ağ kontrolü
        statusText.innerText = "MetaMask'tan Arc Testnet işlemi için onay bekleniyor...";
        
        const tx = await signer.sendTransaction({
            to: MY_ADDRESS,
            value: ethers.utils.parseEther(MINT_PRICE)
        });

        statusText.innerText = "İşlem Arc ağında onaylanıyor...";
        await tx.wait();

        mintedCount++;
        mintedCountEl.innerText = `${mintedCount} / 1000`;
        statusText.innerText = `🎉 Tebrikler! Arc Genesis Pass #${mintedCount} Arc Testnet üzerinde mint edildi!`;
    } catch (err) {
        statusText.innerText = "Hata: " + (err.reason || err.message || "İşlem iptal edildi.");
        console.error(err);
    }
});
