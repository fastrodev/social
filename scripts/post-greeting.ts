const API_URL = "https://web.fastro.dev/api/post";
const DEFAULT_IMAGE = "https://example.com/default-image.jpg";

interface PostData {
  content: string;
  isMarkdown: boolean;
  image: string;
  defaultImage: string;
}

async function checkApiHealth(
  maxRetries = 5,
  delayMs = 2000,
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const healthcheckUrl = `https://web.fastro.dev/api/healthcheck`;
      const response = await fetch(healthcheckUrl);

      if (response.ok) {
        console.log(`API healthcheck passed on attempt ${attempt}`);
        return true;
      }

      console.warn(
        `Healthcheck attempt ${attempt}/${maxRetries} failed: ${response.status} ${response.statusText}`,
      );

      if (attempt < maxRetries) {
        console.log(`Waiting ${delayMs / 1000} seconds before retry...`);
        await sleep(delayMs);
      }
    } catch (error) {
      console.error(
        `Healthcheck attempt ${attempt}/${maxRetries} error:`,
        error,
      );

      if (attempt < maxRetries) {
        console.log(`Waiting ${delayMs / 1000} seconds before retry...`);
        await sleep(delayMs);
      }
    }
  }

  console.error(`API healthcheck failed after ${maxRetries} attempts`);
  return false;
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
      "# Pagi penuh dengan sinar matahari dan harapan. (Kate Chopin)\nSetiap pagi membawa harapan baru dan semangat untuk memulai hari.\n#quote",
      "# Pagi adalah waktu penting dalam sehari, karena bagaimana Anda menghabiskan pagi Anda sering kali menentukan seperti apa hari yang akan Anda jalani. (Lemony Snicket)\nAwali pagi dengan kebiasaan baik agar harimu lebih bermakna.\n#quote",
      "# Setiap pagi membawa potensi baru, tetapi jika Anda terus memikirkan kegagalan hari sebelumnya, Anda cenderung mengabaikan peluang luar biasa. (Harvey Mackay)\nLupakan kegagalan kemarin, fokuslah pada peluang hari ini.\n#quote",
      "# Tuliskan di hati Anda bahwa setiap hari adalah hari terbaik dalam setahun. (Ralph Waldo Emerson)\nSetiap hari adalah kesempatan baru untuk menjadi lebih baik.\n#quote",
      "# Matahari belum pernah menemukanku masih di tempat tidur selama lima puluh tahun. (Thomas Jefferson)\nBangun pagi adalah kunci untuk memulai hari dengan produktif.\n#quote",
      "# Anda harus bangun setiap pagi dengan tekad jika ingin tidur dengan kepuasan. (George Lorimer)\nTekad di pagi hari menentukan kepuasan di malam hari.\n#quote",
      "# Angin di fajar memiliki rahasia untuk diceritakan kepada Anda. Jangan kembali tidur. (Rumi)\nPagi hari penuh inspirasi dan peluang baru.\n#quote",
      "# Saya bangun setiap pagi pukul sembilan dan mencari koran pagi. Kemudian saya melihat halaman obituari. Jika nama saya tidak ada di sana, saya bangun. (Benjamin Franklin)\nSyukuri setiap pagi sebagai anugerah kehidupan.\n#quote",
      "# Setiap pagi kita dilahirkan kembali. Apa yang kita lakukan hari ini adalah yang terpenting. (Buddha)\nHari ini adalah kesempatan untuk memperbaiki diri.\n#quote",
      "# Ketika Anda bangun di pagi hari, pikirkan betapa berharganya hak istimewa untuk hidup - untuk bernapas, berpikir, menikmati, mencintai. (Marcus Aurelius)\nSyukuri setiap detik kehidupan yang diberikan.\n#quote",
      "# Setiap pagi adalah awal yang baru. (T.S. Eliot)\nJadikan pagi sebagai momen memulai sesuatu yang positif.\n#quote",
      "# Bangunlah dengan tekad, tidurlah dengan kepuasan. (George Lorimer)\nAwali hari dengan semangat, akhiri dengan rasa syukur.\n#quote",
      "# Pagi adalah waktu untuk memulai lagi. (Dalai Lama)\nSetiap pagi adalah kesempatan kedua untuk memperbaiki diri.\n#quote",
      "# Setiap hari adalah kesempatan kedua. (Oprah Winfrey)\nJangan sia-siakan hari ini, manfaatkan sebaik mungkin.\n#quote",
      "# Pagi adalah janji baru. (Ralph Waldo Emerson)\nPagi membawa harapan dan janji untuk hari yang lebih baik.\n#quote",
      "# Hari ini adalah hari yang belum pernah kamu lihat sebelumnya. (Maya Angelou)\nSetiap hari adalah petualangan baru yang menanti dijalani.\n#quote",
      "# Pagi adalah berkah, syukuri dan jalani. (Roy T. Bennett)\nNikmati setiap pagi dengan penuh rasa syukur.\n#quote",
      "# Awali hari dengan senyuman. (Mother Teresa)\nSenyuman di pagi hari membawa energi positif sepanjang hari.\n#quote",
      "# Pagi adalah waktu terbaik untuk bermimpi besar. (Eleanor Roosevelt)\nGunakan pagi hari untuk merencanakan dan bermimpi besar.\n#quote",
      "# Setiap pagi adalah hadiah. (Alice Morse Earle)\nJangan lupa bersyukur atas hadiah pagi ini.\n#quote",
    ];
    return getDailyQuote(morningQuotes);
  } else if (hour === 13) {
    const afternoonQuotes = [
      "# Hidup adalah apa yang terjadi ketika Anda sibuk membuat rencana lain. (John Lennon)\nNikmati momen sekarang, jangan terlalu sibuk merencanakan masa depan.\n#quote",
      "# Siang hari tahu apa yang tidak pernah diduga oleh pagi hari. (Robert Frost)\nSetiap waktu membawa pelajaran dan kejutan baru.\n#quote",
      "# Orang yang bekerja adalah orang yang bahagia. Orang yang menganggur adalah orang yang menderita. (Benjamin Franklin)\nAktivitas dan kerja keras membawa kebahagiaan sejati.\n#quote",
      "# Masa depan milik mereka yang percaya pada keindahan impian mereka. (Eleanor Roosevelt)\nPercaya pada mimpi adalah langkah awal menuju masa depan cerah.\n#quote",
      "# Tidak semua yang mengembara tersesat. (J.R.R. Tolkien)\nJangan takut mencoba hal baru, setiap perjalanan punya makna.\n#quote",
      "# Satu-satunya cara untuk melakukan pekerjaan hebat adalah mencintai apa yang Anda lakukan. (Steve Jobs)\nCinta pada pekerjaan menghasilkan karya terbaik.\n#quote",
      "# Jika kesempatan tidak mengetuk, bangunlah sebuah pintu. (Milton Berle)\nCiptakan peluangmu sendiri, jangan hanya menunggu.\n#quote",
      "# Kesuksesan bukanlah akhir, kegagalan tidak fatal: Keberanianlah untuk melanjutkan yang penting. (Winston Churchill)\nKeberanian untuk terus maju lebih penting dari hasil.\n#quote",
      "# Waktu terbaik untuk menanam pohon adalah 20 tahun yang lalu. Waktu terbaik kedua adalah sekarang. (Pepatah Cina)\nMulailah sekarang, tidak ada kata terlambat.\n#quote",
      "# Anda kehilangan 100% tembakan yang tidak Anda ambil. (Wayne Gretzky)\nJangan ragu mencoba, kegagalan terbesar adalah tidak mencoba sama sekali.\n#quote",
      "# Jangan menunggu; waktu tidak akan pernah tepat. (Napoleon Hill)\nAmbil tindakan sekarang juga, jangan menunda.\n#quote",
      "# Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras. (Tim Notke)\nKerja keras adalah kunci utama kesuksesan.\n#quote",
      "# Keberhasilan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan. (Colin Powell)\nBelajar dari kegagalan membuatmu semakin kuat.\n#quote",
      "# Jangan biarkan apa yang tidak bisa Anda lakukan mengganggu apa yang bisa Anda lakukan. (John Wooden)\nFokus pada kelebihanmu, bukan kekuranganmu.\n#quote",
      "# Setiap hari adalah kesempatan untuk menjadi lebih baik. (Unknown)\nGunakan siang hari untuk berkembang dan memperbaiki diri.\n#quote",
      "# Jangan takut gagal, takutlah untuk tidak mencoba. (Roy T. Bennett)\nKegagalan adalah bagian dari proses menuju sukses.\n#quote",
      "# Lakukan sesuatu hari ini yang akan membuat dirimu di masa depan berterima kasih. (Sean Patrick Flanery)\nBuat keputusan yang baik untuk masa depanmu.\n#quote",
      "# Kesempatan tidak datang dua kali. (Pepatah Jepang)\nManfaatkan setiap kesempatan yang datang padamu.\n#quote",
      "# Jangan pernah menyerah pada mimpi Anda. (Barack Obama)\nTerus kejar mimpimu meski banyak rintangan.\n#quote",
      "# Kerja keras adalah kunci kesuksesan. (Vince Lombardi)\nTidak ada kesuksesan tanpa usaha dan kerja keras.\n#quote",
    ];
    return getDailyQuote(afternoonQuotes);
  } else if (hour === 16) {
    const lateAfternoonQuotes = [
      "# Jangan menghitung hari-hari, buatlah hari-hari itu berarti. (Muhammad Ali)\nIsi setiap hari dengan hal yang bermakna dan bermanfaat.\n#quote",
      "# Suatu hari nanti bukanlah hari dalam seminggu. (Denise Brennan-Nelson)\nJangan menunda, lakukan sekarang juga.\n#quote",
      "# Rahasia untuk maju adalah memulai. (Mark Twain)\nLangkah pertama adalah kunci untuk mencapai tujuan.\n#quote",
      "# Waktu Anda terbatas, jangan sia-siakan dengan menjalani hidup orang lain. (Steve Jobs)\nHiduplah sesuai keinginan dan prinsipmu sendiri.\n#quote",
      "# Pesimis mengeluh tentang angin; optimis berharap itu berubah; realis menyesuaikan layar. (William Arthur Ward)\nSikap menentukan hasil yang kamu dapatkan.\n#quote",
      "# Saya belum gagal. Saya baru saja menemukan 10.000 cara yang tidak berhasil. (Thomas Edison)\nKegagalan adalah bagian dari proses menuju keberhasilan.\n#quote",
      "# Satu-satunya batasan untuk mewujudkan hari esok adalah keraguan kita hari ini. (Franklin D. Roosevelt)\nPercaya diri adalah kunci untuk masa depan yang lebih baik.\n#quote",
      "# Tidak masalah seberapa lambat Anda melangkah selama Anda tidak berhenti. (Confucius)\nKonsistensi lebih penting daripada kecepatan.\n#quote",
      "# Kualitas bukanlah tindakan, melainkan kebiasaan. (Aristotle)\nBiasakan melakukan hal baik setiap hari.\n#quote",
      "# Cara untuk memulai adalah berhenti berbicara dan mulai melakukan. (Walt Disney)\nAksi nyata lebih baik dari sekadar rencana.\n#quote",
      "# Sukses adalah jumlah dari usaha kecil yang diulang hari demi hari. (Robert Collier)\nKeberhasilan didapat dari kebiasaan baik yang konsisten.\n#quote",
      "# Jangan pernah menyerah, keajaiban terjadi setiap hari. (Unknown)\nTetap semangat, keajaiban bisa datang kapan saja.\n#quote",
      "# Kegagalan adalah kesempatan untuk memulai lagi dengan lebih cerdas. (Henry Ford)\nBelajar dari kegagalan untuk menjadi lebih baik.\n#quote",
      "# Jangan menunggu inspirasi, jadilah inspirasi. (Unknown)\nJadilah sumber inspirasi bagi orang lain.\n#quote",
      "# Setiap sore adalah kesempatan untuk refleksi dan pertumbuhan. (Unknown)\nGunakan waktu sore untuk merenung dan memperbaiki diri.\n#quote",
      "# Jangan takut berjalan lambat, takutlah jika hanya berdiri diam. (Pepatah Cina)\nTerus bergerak maju, sekecil apapun langkahmu.\n#quote",
      "# Keberanian adalah kunci untuk maju. (Winston Churchill)\nBerani mencoba hal baru membuka banyak peluang.\n#quote",
      "# Jangan biarkan kemarin mengambil terlalu banyak dari hari ini. (Will Rogers)\nFokus pada hari ini, bukan masa lalu.\n#quote",
      "# Setiap langkah kecil membawa perubahan besar. (Unknown)\nPerubahan besar dimulai dari langkah kecil.\n#quote",
      "# Sore adalah waktu untuk bersyukur atas pencapaian hari ini. (Unknown)\nLuangkan waktu untuk menghargai apa yang sudah dicapai.\n#quote",
    ];
    return getDailyQuote(lateAfternoonQuotes);
  } else if (hour === 20) {
    const eveningQuotes = [
      "# Semakin gelap malam, semakin terang bintang-bintang. (Fyodor Dostoevsky)\nMalam hari adalah waktu yang tepat untuk merenung dan menemukan harapan baru.\n#quote",
      "# Setiap malam, ketika saya tidur, saya mati. Dan keesokan paginya, ketika saya bangun, saya dilahirkan kembali. (Mahatma Gandhi)\nTidur malam memberi kesempatan untuk memulai hari baru esoknya.\n#quote",
      "# Malam lebih hidup dan lebih kaya warnanya daripada siang hari. (Vincent Van Gogh)\nKeindahan malam membawa ketenangan dan inspirasi.\n#quote",
      "# Apa yang dilakukan karena cinta selalu terjadi di luar baik dan jahat. (Friedrich Nietzsche)\nCinta adalah motivasi terbesar dalam hidup.\n#quote",
      "# Ada waktu untuk banyak kata, dan ada juga waktu untuk tidur. (Homer)\nIstirahat malam penting untuk kesehatan jiwa dan raga.\n#quote",
      "# Di akhir hari, kita bisa menanggung lebih banyak dari yang kita kira. (Frida Kahlo)\nKekuatan sejati terlihat di penghujung hari.\n#quote",
      "# Manusia adalah jenius ketika dia bermimpi. (Akira Kurosawa)\nMalam hari adalah waktu terbaik untuk bermimpi besar.\n#quote",
      "# Jangan pernah tidur dalam keadaan marah. Tetaplah bangun dan bertengkar. (Phyllis Diller)\nSelesaikan masalah sebelum tidur agar hati tenang.\n#quote",
      "# Saya pikir cara terbaik untuk mendapatkan tidur nyenyak adalah bekerja keras sepanjang hari. Jika Anda bekerja keras dan, tentu saja, berolahraga. (William H. McRaven)\nKerja keras di siang hari akan membuat tidur lebih nyenyak.\n#quote",
      "# Malam adalah ibu dari nasihat. (Pepatah Yunani)\nBanyak inspirasi dan nasihat datang di waktu malam.\n#quote",
      "# Malam adalah waktu untuk merenung dan bersyukur. (Unknown)\nGunakan malam untuk introspeksi dan bersyukur.\n#quote",
      "# Bintang hanya terlihat di kegelapan. (Martin Luther King Jr.)\nKesulitan membuat kita lebih menghargai kebahagiaan.\n#quote",
      "# Malam membawa kedamaian bagi jiwa. (Unknown)\nNikmati ketenangan malam untuk menenangkan pikiran.\n#quote",
      "# Tidur adalah meditasi terbaik. (Dalai Lama)\nTidur yang cukup adalah kunci kesehatan.\n#quote",
      "# Malam adalah waktu untuk bermimpi besar. (Unknown)\nJangan takut bermimpi, malam adalah waktunya harapan.\n#quote",
      "# Setiap malam adalah kesempatan untuk memulai lagi besok. (Unknown)\nTutup hari dengan harapan baru untuk esok.\n#quote",
      "# Malam adalah waktu untuk melepaskan dan memaafkan. (Unknown)\nMaafkan diri sendiri dan orang lain sebelum tidur.\n#quote",
      "# Ketenangan malam membawa inspirasi baru. (Unknown)\nManfaatkan ketenangan malam untuk mencari ide-ide segar.\n#quote",
      "# Malam adalah waktu untuk beristirahat dan bersyukur. (Unknown)\nSyukuri segala pencapaian hari ini sebelum tidur.\n#quote",
      "# Bulan dan bintang menemani malam yang sunyi. (Unknown)\nBiarkan keindahan malam menenangkan hatimu.\n#quote",
    ];
    return getDailyQuote(eveningQuotes);
  } else {
    const defaultQuotes = [
      "# Jadilah diri sendiri; orang lain sudah ada. (Oscar Wilde)\nKeunikanmu adalah kekuatanmu.\n#quote",
      "# Dua hal tidak terbatas: alam semesta dan kebodohan manusia; dan saya tidak yakin tentang alam semesta. (Albert Einstein)\nBelajarlah tanpa henti, dunia ini luas untuk dijelajahi.\n#quote",
      "# Dalam tiga kata saya dapat merangkum semua yang saya pelajari tentang hidup: hidup terus berlanjut. (Robert Frost)\nApapun yang terjadi, hidup akan terus berjalan.\n#quote",
      "# Satu-satunya perjalanan yang mustahil adalah yang tidak pernah Anda mulai. (Tony Robbins)\nMulailah langkah pertamamu hari ini.\n#quote",
      "# Hidup adalah apa yang kita buat, selalu begitu, dan akan selalu begitu. (Grandma Moses)\nKita adalah penentu arah hidup kita sendiri.\n#quote",
      "# Tujuan hidup kita adalah untuk bahagia. (Dalai Lama)\nKebahagiaan adalah tujuan utama dalam hidup.\n#quote",
      "# Anda hanya hidup sekali, tetapi jika Anda melakukannya dengan benar, sekali saja sudah cukup. (Mae West)\nJalani hidup dengan sepenuh hati.\n#quote",
      "# Banyak kegagalan hidup adalah orang-orang yang tidak menyadari betapa dekatnya mereka dengan kesuksesan ketika mereka menyerah. (Thomas A. Edison)\nJangan menyerah, kesuksesan mungkin sudah sangat dekat.\n#quote",
      "# Tidak pernah terlambat untuk menjadi apa yang seharusnya Anda menjadi. (George Eliot)\nTidak ada kata terlambat untuk berubah dan berkembang.\n#quote",
      "# Kemarin adalah sejarah, besok adalah misteri, hari ini adalah hadiah Tuhan, itulah sebabnya kita menyebutnya saat ini. (Bill Keane)\nHargai dan nikmati setiap momen hari ini.\n#quote",
      "# Hidup adalah petualangan yang berani atau tidak sama sekali. (Helen Keller)\nAmbil risiko dan nikmati petualangan hidupmu.\n#quote",
      "# Kebahagiaan bukanlah sesuatu yang sudah jadi. Itu berasal dari tindakan Anda sendiri. (Dalai Lama)\nBahagia adalah hasil dari pilihan dan tindakan kita.\n#quote",
      "# Jangan biarkan apa yang tidak bisa Anda lakukan mengganggu apa yang bisa Anda lakukan. (John Wooden)\nFokus pada kemampuanmu, bukan keterbatasanmu.\n#quote",
      "# Keberanian adalah perlawanan terhadap ketakutan, penguasaan atas ketakutan, bukan ketiadaan ketakutan. (Mark Twain)\nKeberanian adalah kunci menghadapi tantangan hidup.\n#quote",
      "# Hidup adalah seni menggambar tanpa penghapus. (John W. Gardner)\nJalani hidup tanpa penyesalan, teruslah berkarya.\n#quote",
      "# Jangan menunggu; waktu tidak akan pernah tepat. (Napoleon Hill)\nWaktu terbaik untuk bertindak adalah sekarang.\n#quote",
      "# Kegagalan adalah bumbu yang memberi rasa pada kesuksesan. (Truman Capote)\nKegagalan membuat kesuksesan terasa lebih berarti.\n#quote",
      "# Hidup adalah 10% apa yang terjadi pada kita dan 90% bagaimana kita meresponsnya. (Charles R. Swindoll)\nSikap menentukan kualitas hidup kita.\n#quote",
      "# Kebahagiaan adalah ketika apa yang Anda pikirkan, katakan, dan lakukan selaras. (Mahatma Gandhi)\nSelaraskan pikiran, ucapan, dan tindakanmu untuk bahagia.\n#quote",
      "# Jangan pernah menyerah pada mimpi Anda. (Barack Obama)\nTerus kejar mimpi meski banyak rintangan.\n#quote",
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

try {
  const isHealthy = await checkApiHealth();
  if (!isHealthy) {
    console.error("API is not healthy, aborting posts");
    Deno.exit(1);
  }

  for (let i = 0; i < 2; i++) {
    await postToApi(i);
    if (i < 1) {
      const delay = getRandomDelay(30000, 120000);
      console.log(
        `Menunggu ${Math.round(delay / 1000)} detik sebelum post berikutnya...`,
      );
      await sleep(delay);
    }
  }
} catch (error) {
  console.error("Error during execution:", error);
  Deno.exit(1);
}
