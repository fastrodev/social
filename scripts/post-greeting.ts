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
    const morningQuotes = [
      "Pagi penuh dengan sinar matahari dan harapan. (Kate Chopin)\n#quote",
      "Pagi adalah waktu penting dalam sehari, karena bagaimana Anda menghabiskan pagi Anda sering kali menentukan seperti apa hari yang akan Anda jalani. (Lemony Snicket)\n#quote",
      "Setiap pagi membawa potensi baru, tetapi jika Anda terus memikirkan kegagalan hari sebelumnya, Anda cenderung mengabaikan peluang luar biasa. (Harvey Mackay)\n#quote",
      "Tuliskan di hati Anda bahwa setiap hari adalah hari terbaik dalam setahun. (Ralph Waldo Emerson)\n#quote",
      "Matahari belum pernah menemukanku masih di tempat tidur selama lima puluh tahun. (Thomas Jefferson)\n#quote",
      "Anda harus bangun setiap pagi dengan tekad jika ingin tidur dengan kepuasan. (George Lorimer)\n#quote",
      "Angin di fajar memiliki rahasia untuk diceritakan kepada Anda. Jangan kembali tidur. (Rumi)\n#quote",
      "Saya bangun setiap pagi pukul sembilan dan mencari koran pagi. Kemudian saya melihat halaman obituari. Jika nama saya tidak ada di sana, saya bangun. (Benjamin Franklin)\n#quote",
      "Setiap pagi kita dilahirkan kembali. Apa yang kita lakukan hari ini adalah yang terpenting. (Buddha)\n#quote",
      "Ketika Anda bangun di pagi hari, pikirkan betapa berharganya hak istimewa untuk hidup - untuk bernapas, berpikir, menikmati, mencintai. (Marcus Aurelius)\n#quote",
    ];
    return morningQuotes[Math.floor(Math.random() * morningQuotes.length)];
  } else if (hour === 13) {
    const afternoonQuotes = [
      "Hidup adalah apa yang terjadi ketika Anda sibuk membuat rencana lain. (John Lennon)\n#quote",
      "Siang hari tahu apa yang tidak pernah diduga oleh pagi hari. (Robert Frost)\n#quote",
      "Orang yang bekerja adalah orang yang bahagia. Orang yang menganggur adalah orang yang menderita. (Benjamin Franklin)\n#quote",
      "Masa depan milik mereka yang percaya pada keindahan impian mereka. (Eleanor Roosevelt)\n#quote",
      "Tidak semua yang mengembara tersesat. (J.R.R. Tolkien)\n#quote",
      "Satu-satunya cara untuk melakukan pekerjaan hebat adalah mencintai apa yang Anda lakukan. (Steve Jobs)\n#quote",
      "Jika kesempatan tidak mengetuk, bangunlah sebuah pintu. (Milton Berle)\n#quote",
      "Kesuksesan bukanlah akhir, kegagalan tidak fatal: Keberanianlah untuk melanjutkan yang penting. (Winston Churchill)\n#quote",
      "Waktu terbaik untuk menanam pohon adalah 20 tahun yang lalu. Waktu terbaik kedua adalah sekarang. (Pepatah Cina)\n#quote",
      "Anda kehilangan 100% tembakan yang tidak Anda ambil. (Wayne Gretzky)\n#quote",
    ];
    return afternoonQuotes[Math.floor(Math.random() * afternoonQuotes.length)];
  } else if (hour === 16) {
    const lateAfternoonQuotes = [
      "Jangan menghitung hari-hari, buatlah hari-hari itu berarti. (Muhammad Ali)\n#quote",
      "Suatu hari nanti bukanlah hari dalam seminggu. (Denise Brennan-Nelson)\n#quote",
      "Rahasia untuk maju adalah memulai. (Mark Twain)\n#quote",
      "Waktu Anda terbatas, jangan sia-siakan dengan menjalani hidup orang lain. (Steve Jobs)\n#quote",
      "Pesimis mengeluh tentang angin; optimis berharap itu berubah; realis menyesuaikan layar. (William Arthur Ward)\n#quote",
      "Saya belum gagal. Saya baru saja menemukan 10.000 cara yang tidak berhasil. (Thomas Edison)\n#quote",
      "Satu-satunya batasan untuk mewujudkan hari esok adalah keraguan kita hari ini. (Franklin D. Roosevelt)\n#quote",
      "Tidak masalah seberapa lambat Anda melangkah selama Anda tidak berhenti. (Confucius)\n#quote",
      "Kualitas bukanlah tindakan, melainkan kebiasaan. (Aristotle)\n#quote",
      "Cara untuk memulai adalah berhenti berbicara dan mulai melakukan. (Walt Disney)\n#quote",
    ];
    return lateAfternoonQuotes[
      Math.floor(Math.random() * lateAfternoonQuotes.length)
    ];
  } else if (hour === 20) {
    const eveningQuotes = [
      "Semakin gelap malam, semakin terang bintang-bintang. (Fyodor Dostoevsky)\n#quote",
      "Setiap malam, ketika saya tidur, saya mati. Dan keesokan paginya, ketika saya bangun, saya dilahirkan kembali. (Mahatma Gandhi)\n#quote",
      "Malam lebih hidup dan lebih kaya warnanya daripada siang hari. (Vincent Van Gogh)\n#quote",
      "Apa yang dilakukan karena cinta selalu terjadi di luar baik dan jahat. (Friedrich Nietzsche)\n#quote",
      "Ada waktu untuk banyak kata, dan ada juga waktu untuk tidur. (Homer)\n#quote",
      "Di akhir hari, kita bisa menanggung lebih banyak dari yang kita kira. (Frida Kahlo)\n#quote",
      "Manusia adalah jenius ketika dia bermimpi. (Akira Kurosawa)\n#quote",
      "Jangan pernah tidur dalam keadaan marah. Tetaplah bangun dan bertengkar. (Phyllis Diller)\n#quote",
      "Saya pikir cara terbaik untuk mendapatkan tidur nyenyak adalah bekerja keras sepanjang hari. Jika Anda bekerja keras dan, tentu saja, berolahraga. (William H. McRaven)\n#quote",
      "Malam adalah ibu dari nasihat. (Pepatah Yunani)\n#quote",
    ];
    return eveningQuotes[Math.floor(Math.random() * eveningQuotes.length)];
  } else {
    const defaultQuotes = [
      "Jadilah diri sendiri; orang lain sudah ada. (Oscar Wilde)\n#quote",
      "Dua hal tidak terbatas: alam semesta dan kebodohan manusia; dan saya tidak yakin tentang alam semesta. (Albert Einstein)\n#quote",
      "Dalam tiga kata saya dapat merangkum semua yang saya pelajari tentang hidup: hidup terus berlanjut. (Robert Frost)\n#quote",
      "Satu-satunya perjalanan yang mustahil adalah yang tidak pernah Anda mulai. (Tony Robbins)\n#quote",
      "Hidup adalah apa yang kita buat, selalu begitu, dan akan selalu begitu. (Grandma Moses)\n#quote",
      "Tujuan hidup kita adalah untuk bahagia. (Dalai Lama)\n#quote",
      "Anda hanya hidup sekali, tetapi jika Anda melakukannya dengan benar, sekali saja sudah cukup. (Mae West)\n#quote",
      "Banyak kegagalan hidup adalah orang-orang yang tidak menyadari betapa dekatnya mereka dengan kesuksesan ketika mereka menyerah. (Thomas A. Edison)\n#quote",
      "Tidak pernah terlambat untuk menjadi apa yang seharusnya Anda menjadi. (George Eliot)\n#quote",
      "Kemarin adalah sejarah, besok adalah misteri, hari ini adalah hadiah Tuhan, itulah sebabnya kita menyebutnya saat ini. (Bill Keane)\n#quote",
    ];
    return defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
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
