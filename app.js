const connectBtn = document.getElementById('connectBtn');
const swapBtn = document.getElementById('swapBtn');
const statusText = document.getElementById('status');
const fromAmount = document.getElementById('fromAmount');
const toAmount = document.getElementById('toAmount');

let signer;
const RATE = 2500; // 1 ARC = 2500 USDC kabul edilen sabit kur
const MY_ADDRESS = "0x28c8BC8e084C14ff404FCd2b82338BDcc2e5D03e";

function calculateSwap() {
    const val = parseFloat(fromAmount.value) || 0;
    toAmount.value = (val * RATE).toFixed(2);
}
calculateSwap();

connectBtn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            connectBtn.style.display = "none";
            swapBtn.style.display = "block";
            statusText.innerText = "Cüzdan başarıyla bağlandı!";
        } catch (err) {
            statusText.innerText = "Cüzdan bağlantısı reddedildi.";
        }
    } else {
        statusText.innerText = "Lütfen MetaMask yükleyin.";
    }
});

swapBtn.addEventListener('click', async () => {
    try {
        const amountInETH = fromAmount.value;
        if (!amountInETH || amountInETH <= 0) {
            statusText.innerText = "Lütfen geçerli bir miktar girin.";
            return;
        }

        statusText.innerText = "MetaMask'tan swap onayı bekleniyor...";
        
        // Arc Testnet üzerinde swap havuzuna token aktarımı mantığını çalıştırır
        const tx = await signer.sendTransaction({
            to: MY_ADDRESS,
            value: ethers.utils.parseEther(amountInETH)
        });

        statusText.innerText = "İşlem ağa gönderildi. Onaylanıyor...";
        await tx.wait();

        statusText.innerText = `🎉 Swap Başarılı! ${amountInETH} ARC karşılığında ${toAmount.value} USDC takas edildi.`;
    } catch (err) {
        statusText.innerText = "Swap işlemi iptal edildi veya başarısız oldu.";
        console.error(err);
    }
});
