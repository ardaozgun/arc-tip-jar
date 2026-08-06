const connectBtn = document.getElementById('connectBtn');
const tipBtn = document.getElementById('tipBtn');
const statusText = document.getElementById('status');

let signer;
// Arc Testnet üzerindeki USDC Kontrat Adresi (Circle dökümanlarından alınmıştır)
const USDC_ADDRESS = "0x892aF0A8050e932baB3F50C2E20a3250eF67B547"; 
const MY_ADDRESS = "0x28c8BC8e084C14ff404FCd2b82338BDcc2e5D03e"; // Kendi cüzdan adresinizi buraya yazın

// Sadece para transferi için gereken basit ERC20 ABI'si
const usdcAbi = ["function transfer(address to, uint256 value) returns (bool)"];

connectBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            connectBtn.innerText = "Cüzdan Bağlandı";
            tipBtn.disabled = false;
            statusText.innerText = "";
        } catch (error) {
            statusText.innerText = "Bağlantı iptal edildi.";
        }
    } else {
        statusText.innerText = "Lütfen MetaMask yükleyin.";
    }
});

tipBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Cüzdandan onay bekleniyor...";
        const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcAbi, signer);
        // USDC 6 ondalık basamağa sahiptir. 1 USDC = 1000000 birim.
        const amount = ethers.utils.parseUnits("1", 6); 
        const tx = await usdcContract.transfer(MY_ADDRESS, amount);
        
        statusText.innerText = "İşlem ağa gönderildi. Onay bekleniyor...";
        await tx.wait(); // İşlemin ağda onaylanmasını bekle
        
        statusText.innerText = "🎉 Teşekkürler! Bahşiş başarıyla gönderildi.";
    } catch (error) {
        statusText.innerText = "İşlem başarısız oldu veya iptal edildi.";
        console.error(error);
    }
});
