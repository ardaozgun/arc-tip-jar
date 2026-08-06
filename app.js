const connectBtn = document.getElementById('connectBtn');
const mintBtn = document.getElementById('mintBtn');
const statusText = document.getElementById('status');
const mintedCountEl = document.getElementById('mintedCount');

let signer;
let mintedCount = 142;
const MINT_PRICE = "0.001"; // Çok düşük miktar belirlendi (Hata almamak için)
const MY_ADDRESS = "0x28c8BC8e084C14ff404FCd2b82338BDcc2e5D03e"; 

connectBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            connectBtn.style.display = "none";
            mintBtn.style.display = "block";
            statusText.innerText = "Cüzdan bağlandı! Mint işlemine hazırsınız.";
        } catch (err) {
            statusText.innerText = "Cüzdan bağlantısı reddedildi.";
        }
    } else {
        statusText.innerText = "Lütfen MetaMask yükleyin.";
    }
});

mintBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "MetaMask'tan NFT Mint onayı bekleniyor...";
        
        const tx = await signer.sendTransaction({
            to: MY_ADDRESS,
            value: ethers.utils.parseEther(MINT_PRICE)
        });

        statusText.innerText = "İşlem ağa gönderildi, NFT basılıyor...";
        await tx.wait();

        mintedCount++;
        mintedCountEl.innerText = `${mintedCount} / 1000`;
        statusText.innerText = `🎉 Tebrikler! Arc Genesis Pass #${mintedCount} başarıyla mint edildi!`;
    } catch (err) {
        statusText.innerText = "Hata: " + (err.reason || err.message || "İşlem iptal edildi.");
        console.error(err);
    }
});
