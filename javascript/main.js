// main.js

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage(); // Firebase Storage 객체

let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const slideIntervalTime = 5000; // 5초마다 슬라이드 전환
let slideInterval;

function showSlide(index) {
  if (index >= slides.length) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = slides.length - 1;
  } else {
    currentSlide = index;
  }

  const offset = -currentSlide * 100;
  document.querySelector(".slider").style.transform = `translateX(${offset}%)`;

  dots.forEach((dot) => dot.classList.remove("active"));
  dots[currentSlide].classList.add("active");
}

function startSlideInterval() {
  slideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, slideIntervalTime);
}

function resetSlideInterval() {
  clearInterval(slideInterval);
  startSlideInterval();
}

document.querySelector(".prev").addEventListener("click", () => {
  showSlide(currentSlide - 1);
  resetSlideInterval();
});

document.querySelector(".next").addEventListener("click", () => {
  showSlide(currentSlide + 1);
  resetSlideInterval();
});

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    resetSlideInterval();
  });
});

showSlide(currentSlide);
startSlideInterval();

const menuIcon = document.getElementById("menu-icon");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

menuIcon.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("show");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
});

const profileImg = document.getElementById("profile-img");
const profileUpload = document.getElementById("profile-upload");
const uploadBtn = document.getElementById("upload-btn");
const loadingSpinner = document.getElementById("loading-spinner");

uploadBtn.addEventListener("click", () => {
  profileUpload.click();
});

profileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadProfileImage(file);
  }
});

function uploadProfileImage(file) {
  const user = auth.currentUser;
  if (user) {
    const storageRef = storage.ref(`profileImages/${user.uid}`);
    const uploadTask = storageRef.put(file);

    // 업로드 시작 시 로딩 스피너 표시
    loadingSpinner.style.display = "block";

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // 업로드 진행 상태를 표시할 수 있습니다 (옵션).
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        // 업로드 중 오류가 발생했습니다.
        console.error("Error uploading image:", error);
        // 오류 발생 시 로딩 스피너 숨김
        loadingSpinner.style.display = "none";
      },
      () => {
        // 업로드가 완료된 후 URL을 가져옵니다.
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          saveUserProfileImage(downloadURL);
          profileImg.src = downloadURL; // 프로필 이미지 업데이트
          // 업로드 완료 시 로딩 스피너 숨김
          loadingSpinner.style.display = "none";
        });
      }
    );
  }
}

function saveUserProfileImage(imageUrl) {
  const user = auth.currentUser;
  if (user) {
    const userRef = db.ref("사용자들/" + user.uid);
    userRef
      .set({
        nickname: document.getElementById("nickname").textContent,
        profileImage: imageUrl,
      })
      .then(() => {
        console.log("Profile image saved successfully");
      })
      .catch((error) => {
        console.error("Error saving profile image:", error);
      });
  }
}

function loadUserProfile() {
  const user = auth.currentUser;
  if (user) {
    const userRef = db.ref("사용자들/" + user.uid);
    userRef
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          document.getElementById("nickname").textContent = userData.nickname;
          if (userData.profileImage) {
            profileImg.src = userData.profileImage;
          } else {
            profileImg.src = "../imgs/profileimg.png";
          }
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    loadUserProfile();
  } else {
    console.log("User is not logged in");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  auth
    .signOut()
    .then(() => {
      window.location.href = "../index.html"; // 로그인 페이지로 이동
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
});

document.getElementById("Reddit").addEventListener("click", () => {
  window.location.href = "list.html";
});
