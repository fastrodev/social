const API_URL = "https://web.fastro.dev/api/post";
const DEFAULT_IMAGE = "https://example.com/default-image.jpg";

interface PostData {
  content: string;
  isMarkdown: boolean;
  image: string;
  defaultImage: string;
}
function getTimeBasedGreeting(index = 0): string {
  const hour = new Date().getHours();
  const dayOfMonth = new Date().getDate();

  const getDailyQuote = (quotes: string[]) => {
    // Tambahkan index agar setiap post di satu run dapat berbeda
    const seed = (dayOfMonth * 31 + hour + index) % quotes.length;
    return quotes[seed];
  };

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
      "Setiap pagi adalah awal yang baru. (T.S. Eliot)\n#quote",
      "Bangunlah dengan tekad, tidurlah dengan kepuasan. (George Lorimer)\n#quote",
      "Pagi adalah waktu untuk memulai lagi. (Dalai Lama)\n#quote",
      "Setiap hari adalah kesempatan kedua. (Oprah Winfrey)\n#quote",
      "Pagi adalah janji baru. (Ralph Waldo Emerson)\n#quote",
      "Hari ini adalah hari yang belum pernah kamu lihat sebelumnya. (Maya Angelou)\n#quote",
      "Pagi adalah berkah, syukuri dan jalani. (Roy T. Bennett)\n#quote",
      "Awali hari dengan senyuman. (Mother Teresa)\n#quote",
      "Pagi adalah waktu terbaik untuk bermimpi besar. (Eleanor Roosevelt)\n#quote",
      "Setiap pagi adalah hadiah. (Alice Morse Earle)\n#quote",
    ];
    return getDailyQuote(morningQuotes);
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
      "Jangan menunggu; waktu tidak akan pernah tepat. (Napoleon Hill)\n#quote",
      "Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras. (Tim Notke)\n#quote",
      "Keberhasilan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan. (Colin Powell)\n#quote",
      "Jangan biarkan apa yang tidak bisa Anda lakukan mengganggu apa yang bisa Anda lakukan. (John Wooden)\n#quote",
      "Setiap hari adalah kesempatan untuk menjadi lebih baik. (Unknown)\n#quote",
      "Jangan takut gagal, takutlah untuk tidak mencoba. (Roy T. Bennett)\n#quote",
      "Lakukan sesuatu hari ini yang akan membuat dirimu di masa depan berterima kasih. (Sean Patrick Flanery)\n#quote",
      "Kesempatan tidak datang dua kali. (Pepatah Jepang)\n#quote",
      "Jangan pernah menyerah pada mimpi Anda. (Barack Obama)\n#quote",
      "Kerja keras adalah kunci kesuksesan. (Vince Lombardi)\n#quote",
    ];
    return getDailyQuote(afternoonQuotes);
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
      "Sukses adalah jumlah dari usaha kecil yang diulang hari demi hari. (Robert Collier)\n#quote",
      "Jangan pernah menyerah, keajaiban terjadi setiap hari. (Unknown)\n#quote",
      "Kegagalan adalah kesempatan untuk memulai lagi dengan lebih cerdas. (Henry Ford)\n#quote",
      "Jangan menunggu inspirasi, jadilah inspirasi. (Unknown)\n#quote",
      "Setiap sore adalah kesempatan untuk refleksi dan pertumbuhan. (Unknown)\n#quote",
      "Jangan takut berjalan lambat, takutlah jika hanya berdiri diam. (Pepatah Cina)\n#quote",
      "Keberanian adalah kunci untuk maju. (Winston Churchill)\n#quote",
      "Jangan biarkan kemarin mengambil terlalu banyak dari hari ini. (Will Rogers)\n#quote",
      "Setiap langkah kecil membawa perubahan besar. (Unknown)\n#quote",
      "Sore adalah waktu untuk bersyukur atas pencapaian hari ini. (Unknown)\n#quote",
    ];
    return getDailyQuote(lateAfternoonQuotes);
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
      "Malam adalah waktu untuk merenung dan bersyukur. (Unknown)\n#quote",
      "Bintang hanya terlihat di kegelapan. (Martin Luther King Jr.)\n#quote",
      "Malam membawa kedamaian bagi jiwa. (Unknown)\n#quote",
      "Tidur adalah meditasi terbaik. (Dalai Lama)\n#quote",
      "Malam adalah waktu untuk bermimpi besar. (Unknown)\n#quote",
      "Setiap malam adalah kesempatan untuk memulai lagi besok. (Unknown)\n#quote",
      "Malam adalah waktu untuk melepaskan dan memaafkan. (Unknown)\n#quote",
      "Ketenangan malam membawa inspirasi baru. (Unknown)\n#quote",
      "Malam adalah waktu untuk beristirahat dan bersyukur. (Unknown)\n#quote",
      "Bulan dan bintang menemani malam yang sunyi. (Unknown)\n#quote",
    ];
    return getDailyQuote(eveningQuotes);
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
      "Hidup adalah petualangan yang berani atau tidak sama sekali. (Helen Keller)\n#quote",
      "Kebahagiaan bukanlah sesuatu yang sudah jadi. Itu berasal dari tindakan Anda sendiri. (Dalai Lama)\n#quote",
      "Jangan biarkan apa yang tidak bisa Anda lakukan mengganggu apa yang bisa Anda lakukan. (John Wooden)\n#quote",
      "Keberanian adalah perlawanan terhadap ketakutan, penguasaan atas ketakutan, bukan ketiadaan ketakutan. (Mark Twain)\n#quote",
      "Hidup adalah seni menggambar tanpa penghapus. (John W. Gardner)\n#quote",
      "Jangan menunggu; waktu tidak akan pernah tepat. (Napoleon Hill)\n#quote",
      "Kegagalan adalah bumbu yang memberi rasa pada kesuksesan. (Truman Capote)\n#quote",
      "Hidup adalah 10% apa yang terjadi pada kita dan 90% bagaimana kita meresponsnya. (Charles R. Swindoll)\n#quote",
      "Kebahagiaan adalah ketika apa yang Anda pikirkan, katakan, dan lakukan selaras. (Mahatma Gandhi)\n#quote",
      "Jangan pernah menyerah pada mimpi Anda. (Barack Obama)\n#quote",
    ];
    return getDailyQuote(defaultQuotes);
  }
}

async function postToApi(index = 0) {
  // Get the image URL from environment or generate one
  let postImage = Deno.env.get("POST_IMAGE");

  // If no image URL is provided in environment, generate one
  if (!postImage || postImage === DEFAULT_IMAGE) {
    postImage = generateImageUrl();
  }

  const postContent = getTimeBasedGreeting(index);

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

for (let i = 0; i < 5; i++) {
  await postToApi(i);
  if (i < 4) {
    const delay = getRandomDelay(30000, 120000);
    console.log(
      `Menunggu ${Math.round(delay / 1000)} detik sebelum post berikutnya...`,
    );
    await sleep(delay);
  }
}
