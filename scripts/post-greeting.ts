const API_URL = "https://web.fastro.dev/api/post";
const DEFAULT_IMAGE = "https://example.com/default-image.jpg";

interface PostData {
  content: string;
  isMarkdown: boolean;
  image: string;
  defaultImage: string;
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour === 6) {
    const morningGreetings = [
      "Selamat pagi! Bangun dan bersinar! Ini adalah hari baru dengan kesempatan baru. Apa tujuan Anda hari ini?",
      "Pagi telah tiba! Dampak positif apa yang akan Anda buat hari ini?",
      "Fajar baru, hari baru! Kemungkinan apa yang akan Anda jelajahi?",
      "Selamat pagi! Siapa cepat dia dapat. Apa kemenangan pertama Anda hari ini?",
      "Pagi yang cerah! Potensi Anda hari ini tak terbatas. Apa yang akan Anda capai?",
      "Pagi yang segar, pola pikir yang segar! Perspektif baru apa yang akan memandu Anda hari ini?",
      "Energi pagi diaktifkan! Salurkan ke prioritas terpenting Anda hari ini.",
      "Bangkit dengan tujuan! Pagi ini menandai awal dari sesuatu yang luar biasa.",
      "Halo, pagi! Dunia penuh dengan kemungkinan yang menunggu sentuhan Anda hari ini.",
      "Optimisme pagi di puncaknya! Tantangan apa yang akan Anda ubah menjadi peluang?",
      "Fajar hari baru! Pilihan pagi Anda menentukan nada - buatlah berarti!",
      "Selamat pagi dunia! Hari ini adalah kanvas kosong - karya apa yang akan Anda ciptakan?",
      "Suasana pagi! Sambut hari ini dengan energi yang pantas didapatkan!",
    ];
    return morningGreetings[
      Math.floor(Math.random() * morningGreetings.length)
    ];
  } else if (hour === 13) {
    const afternoonGreetings = [
      "Tambahan energi siang hari! Semoga hari Anda berjalan lancar. Ingatlah untuk mengambil momen untuk bernapas dan memfokuskan kembali.",
      "Periksa tengah hari! Bagaimana produktivitas Anda? Waktunya untuk penyegaran cepat?",
      "Motivasi siang hari! Hari sudah setengah berlalu - manfaatkan sisanya!",
      "Jeda siang! Bagaimana hari Anda berkembang? Saatnya menilai kembali prioritas untuk dampak maksimal.",
      "Pemeriksaan momentum tengah hari! Jaga energi positif mengalir sepanjang sore.",
      "Waktu refleksi siang! Apa yang telah Anda capai sejauh ini dan apa selanjutnya?",
      "Kebijaksanaan jam makan siang: Sore hari adalah kesempatan kedua Anda untuk membuat hari ini luar biasa!",
      "Tombol reset siang hari! Jernihkan pikiran, fokuskan kembali energi Anda, dan selesaikan dengan kuat.",
      "Salam tengah hari! Ingat bahwa kemajuan konsisten mengalahkan kesempurnaan sporadis.",
      "Peregangan siang hari! Berdiri, bernapas dalam-dalam, dan berkomitmen kembali pada tujuan penting Anda.",
      "Perspektif siang: Anda tidak hanya sibuk, Anda sedang membangun sesuatu yang bermakna!",
      "Suasana siang yang cerah! Biarkan produktivitas Anda bersinar secerah matahari siang.",
      "Pengingat siang: Kesejahteraan Anda penting! Luangkan waktu untuk memeriksa diri Anda sendiri.",
    ];
    return afternoonGreetings[
      Math.floor(Math.random() * afternoonGreetings.length)
    ];
  } else if (hour === 16) {
    const lateAfternoonGreetings = [
      "Memeriksa sore hari! Bagaimana hari Anda? Masih ada waktu untuk mencapai sesuatu yang berarti sebelum hari berakhir.",
      "Tahap akhir hari kerja! Apa satu hal lagi yang bisa Anda capai?",
      "Waktu refleksi sore! Apa kemenangan Anda hari ini, dan apa yang masih dalam daftar Anda?",
      "Jendela kesempatan jam 4 sore! Anda masih punya waktu untuk membuat hari ini berarti dengan cara yang istimewa.",
      "Pemeriksaan energi sore! Apa yang paling membutuhkan perhatian Anda sebelum mengakhiri hari?",
      "Produktivitas di jam keemasan! Jadikan jam kerja terakhir ini bersinar dengan usaha terfokus.",
      "Persiapan akhir sore dimulai! Prioritaskan tugas Anda yang tersisa dengan bijak.",
      "Sprint terakhir hari! Apa yang layak mendapatkan energi dan perhatian Anda sebelum waktu tutup?",
      "Inspirasi akhir hari: Selesaikan lebih kuat dari yang Anda mulai, bahkan ketika energi memudar.",
      "Hampir selesai! Tugas penting apa yang dapat Anda selesaikan sebelum hari kerja berakhir?",
      "Zona penyelesaian sore! Saatnya menyelesaikan hal-hal kecil dan mempersiapkan diri untuk besok.",
      "Pengingat jam 4 sore: Diri Anda di masa depan akan berterima kasih karena menyelesaikan hari dengan kuat!",
      "Cek sore hari: Jangan biarkan sempurna menjadi musuh dari selesai saat Anda mengakhiri hari ini.",
    ];
    return lateAfternoonGreetings[
      Math.floor(Math.random() * lateAfternoonGreetings.length)
    ];
  } else if (hour === 20) {
    const eveningGreetings = [
      "Refleksi malam! Saat hari mulai berakhir, apa pencapaian terbesar Anda hari ini? Saatnya mengisi ulang untuk petualangan besok.",
      "Mengakhiri hari? Luangkan waktu untuk merayakan apa yang telah Anda capai!",
      "Suasana malam! Saatnya bersantai dan bersiap untuk hari lain penuh kemungkinan esok.",
      "Momen syukur malam hari! Tiga hal apa yang berjalan baik hari ini yang Anda hargai?",
      "Kebijaksanaan malam: Usaha hari ini menjadi hasil besok. Beristirahatlah dengan baik!",
      "Mode istirahat malam diaktifkan! Saatnya beralih dari mode produktivitas ke mode pemulihan.",
      "Bintang-bintang mulai tampak! Saat hari Anda berakhir, momen apa yang paling bersinar bagi Anda?",
      "Refleksi malam: Kemajuan tidak selalu terlihat dalam sekejap, tapi Anda terus maju!",
      "Pikiran senja: Lepaskan tantangan hari ini dan sambut potensi esok hari.",
      "Ritual akhir hari: Rayakan kemenangan, belajar dari kegagalan, dan bersiap untuk awal yang baru.",
      "Pengingat malam: Istirahat bukan kemalasan, tapi persiapan untuk produktivitas masa depan!",
      "Malam menjelang! Saatnya mematikan pikiran dan mengisi ulang semangat Anda.",
      "Mantra malam: Anda sudah melakukan yang terbaik hari ini, dan itu selalu cukup.",
    ];
    return eveningGreetings[
      Math.floor(Math.random() * eveningGreetings.length)
    ];
  } else {
    const defaultGreetings = [
      "Halo! Semoga hari Anda menyenangkan!",
      "Salam! Setiap momen adalah kesempatan untuk membuat perubahan positif.",
      "Hai teman! Ingatlah bahwa perjalanan Anda penting, jam berapapun sekarang.",
      "Memeriksa dengan pengingat ramah bahwa Anda melakukannya dengan baik!",
      "Halo! Mengambil langkah kecil secara konsisten mengarah pada hasil besar.",
      "Pengingat ramah: Kesejahteraan Anda penting setiap jam sepanjang hari.",
      "Saatnya untuk momen kesadaran singkat. Tarik napas dalam-dalam!",
      "Jam berapapun sekarang, selalu momen yang tepat untuk merayakan kemajuan Anda.",
      "Mengirimkan energi positif untuk Anda, apa pun jamnya!",
      "Ingat: Setiap momen mengandung benih kesempatan.",
    ];
    return defaultGreetings[
      Math.floor(Math.random() * defaultGreetings.length)
    ];
  }
}

async function postToApi() {
  // Get the image URL from environment or generate one
  let postImage = Deno.env.get("POST_IMAGE");

  // If no image URL is provided in environment, generate one
  if (!postImage || postImage === DEFAULT_IMAGE) {
    postImage = generateImageUrl();
  }

  const postContent = getTimeBasedGreeting();

  const postData: PostData = {
    content: postContent,
    isMarkdown: true,
    image: postImage,
    defaultImage: postImage,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include API key if needed
        ...(Deno.env.get("API_KEY") &&
          { "Authorization": `Bearer ${Deno.env.get("API_KEY")}` }),
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(
        `Error posting to API: ${response.status} ${response.statusText}`,
      );
    }

    console.log("Post successful!");
    console.log("Content:", postContent);
    console.log("Image URL:", postImage);
  } catch (error) {
    console.error("Failed to post:", error);
    Deno.exit(1);
  }
}

function generateImageUrl(): string {
  const id = Math.floor(Math.random() * 1000) + 1;
  return `https://picsum.photos/seed/${id}/800/600.jpg`;
}

await postToApi();
