// Firebase 인증, 데이터베이스, 저장소 객체 초기화
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage(); // Firebase Storage 객체

// 슬라이드 쇼 관련 변수 초기화
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const slideIntervalTime = 5000; // 5초마다 슬라이드 전환
let slideInterval;

// 슬라이드 쇼의 특정 슬라이드를 표시하는 함수
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

// 슬라이드 쇼 자동 전환 시작
function startSlideInterval() {
  slideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, slideIntervalTime);
}

// 슬라이드 쇼 자동 전환 초기화
function resetSlideInterval() {
  clearInterval(slideInterval);
  startSlideInterval();
}

// 이전 슬라이드로 이동 버튼 클릭 이벤트 리스너
document.querySelector(".prev").addEventListener("click", () => {
  showSlide(currentSlide - 1);
  resetSlideInterval();
});

// 다음 슬라이드로 이동 버튼 클릭 이벤트 리스너
document.querySelector(".next").addEventListener("click", () => {
  showSlide(currentSlide + 1);
  resetSlideInterval();
});

// 슬라이드 점(dot)을 클릭하면 해당 슬라이드로 이동
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    resetSlideInterval();
  });
});

// 첫 슬라이드를 표시하고 자동 전환 시작
showSlide(currentSlide);
startSlideInterval();

// 메뉴 아이콘 및 사이드바 관련 변수 초기화
const menuIcon = document.getElementById("menu-icon");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

// 메뉴 아이콘 클릭 시 사이드바 표시
menuIcon.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("show");
});

// 사이드바 오버레이 클릭 시 사이드바 숨기기
sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
});

// 프로필 이미지 업로드 관련 변수 초기화
const profileImg = document.getElementById("profile-img");
const profileUpload = document.getElementById("profile-upload");
const uploadBtn = document.getElementById("upload-btn");
const loadingSpinner = document.getElementById("loading-spinner");

// 업로드 버튼 클릭 시 파일 선택 창 열기
uploadBtn.addEventListener("click", () => {
  profileUpload.click();
});

// 파일 선택 시 프로필 이미지 업로드 함수 호출
profileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    uploadProfileImage(file);
  }
});

// 프로필 이미지 업로드 함수
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
        // 업로드 진행 상태를 표시 (옵션)
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        // 업로드 중 오류 발생 시 로딩 스피너 숨김
        console.error("Error uploading image:", error);
        loadingSpinner.style.display = "none";
      },
      () => {
        // 업로드 완료 후 URL 가져오기
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          saveUserProfileImage(downloadURL);
          profileImg.src = downloadURL; // 프로필 이미지 업데이트
          loadingSpinner.style.display = "none";
        });
      }
    );
  }
}

// 업로드된 프로필 이미지 URL을 데이터베이스에 저장
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

// 사용자 프로필을 불러오는 함수
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

// 사용자 인증 상태 변경 시 프로필 불러오기
auth.onAuthStateChanged((user) => {
  if (user) {
    loadUserProfile();
  } else {
    console.log("User is not logged in");
  }
});

// 로그아웃 버튼 클릭 시 로그아웃 처리
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

// 사이트 이동 기능 --------------------------------------------------------------

// Reddit 페이지로 이동
document.getElementById("Reddit").addEventListener("click", () => {
  window.location.href = "list.html";
});

// Office 페이지로 이동
document.getElementById("office").addEventListener("click", () => {
  window.location.href = "office.html";
});
