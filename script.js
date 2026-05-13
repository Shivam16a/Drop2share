const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyPzs97QQvKOUma7VEVpkjT0hZ_2JHJbSmmUahUtZ604MtlJu3pLoNHPtQnGDXrbreGUA/exec";

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");

const progressBox = document.getElementById("progressBox");
const progress = document.getElementById("progress");
const percent = document.getElementById("percent");

const result = document.getElementById("result");
const link = document.getElementById("link");
const copyBtn = document.getElementById("copyBtn");

/* browse */
browseBtn.onclick = () => fileInput.click();

/* select */
fileInput.onchange = () => upload(fileInput.files[0]);

/* drag */
dropArea.addEventListener("dragover", (e) => e.preventDefault());

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    upload(e.dataTransfer.files[0]);
});

/* upload */
async function upload(file) {

    progressBox.style.display = "block";
    progress.style.width = "0%";
    percent.innerText = "0%";

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {

        const base64 = reader.result.split(",")[1];

        const payload = {
            file: base64,
            fileName: file.name,
            mimeType: file.type
        };

        try {

            const response = await fetch(WEB_APP_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const text = await response.text();
            // console.log("RESPONSE:", text);

            const data = JSON.parse(text);

            if (!data.success) {
                alert(data.error || "Upload failed");
                return;
            }

            /* progress animation */
            let p = 0;

            const interval = setInterval(() => {

                p += 10;
                progress.style.width = p + "%";
                percent.innerText = p + "%";

                if (p >= 100) {

                    clearInterval(interval);

                    result.style.display = "block";

                    link.value = data.fileUrl;

                    document.getElementById("qrcode").innerHTML = "";

                    new QRCode(document.getElementById("qrcode"), {
                        text: data.fileUrl,
                        width: 180,
                        height: 180
                    });
                }

            }, 60);

        } catch (err) {
            console.log(err);
            alert("Upload failed (check Apps Script deployment)");
        }
    };
}

/* copy */
copyBtn.onclick = () => {
    navigator.clipboard.writeText(link.value);
    copyBtn.innerText = "Copied!";
    setTimeout(() => copyBtn.innerText = "Copy Link", 1500);
};