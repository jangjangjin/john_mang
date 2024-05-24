// Firebase 데이터베이스 및 인증 객체 생성
const db = firebase.database();
const boardsRef = db.ref("bulletinBoards");
const usersRef = db.ref("사용자들");
const storageRef = firebase.storage().ref(); // Firebase 스토리지에 대한 레퍼런스
const auth = firebase.auth(); // Firebase 인증에 대한 레퍼런스

let currentPage = 1;
const itemsPerPage = 10;

// Redirect to creation page
document.getElementById("create-post-btn").addEventListener("click", () => {
  window.location.href = "list_create.html";
});

// Fetch bulletin boards and render list
function fetchBulletinBoards(page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  boardsRef
    .orderByKey()
    .limitToFirst(end)
    .once("value", (snapshot) => {
      const boards = [];
      snapshot.forEach((childSnapshot) => {
        boards.push({ key: childSnapshot.key, ...childSnapshot.val() });
      });
      renderBulletinBoards(boards.slice(start, end));
      renderPagination(boards.length);
    });
}

// Render bulletin boards
function renderBulletinBoards(boards) {
  const boardList = document.getElementById("board-list");
  boardList.innerHTML = "";

  boards.forEach((board) => {
    const boardItem = document.createElement("div");
    boardItem.className = "board-item";
    const userId = board.userId;

    usersRef.child(userId).once("value", (userSnapshot) => {
      const user = userSnapshot.val();
      const username = user ? user.nickname : "Unknown User";
      const createdAt = new Date(board.createdAt).toLocaleString();

      boardItem.innerHTML = `
        <div><h2>${board.title}</h2></div>
        <div>${username}</div>
        <div>${createdAt}</div>
        <div>${board.views || 0} 조회수</div>
        <div>${board.recommendations || 0} 추천수</div>
      `;

      if (board.recommendations && board.recommendations >= 10) {
        boardItem.querySelector("h2").classList.add("red-text");
      }

      boardItem.addEventListener("click", () => {
        window.location.href = `detail.html?id=${board.key}`;
      });

      boardList.appendChild(boardItem);
    });
  });
}

// Render pagination
function renderPagination(totalItems) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("span");
    pageLink.className = "page-link" + (i === currentPage ? " active" : "");
    pageLink.textContent = i;
    pageLink.addEventListener("click", () => {
      currentPage = i;
      fetchBulletinBoards(currentPage);
    });
    pagination.appendChild(pageLink);
  }
}

// Search functionality
document.getElementById("search-button").addEventListener("click", () => {
  const query = document.getElementById("search").value.toLowerCase();
  boardsRef.once("value", (snapshot) => {
    const boards = [];
    snapshot.forEach((childSnapshot) => {
      const board = childSnapshot.val();
      if (
        board.title.toLowerCase().includes(query) ||
        board.content.toLowerCase().includes(query)
      ) {
        boards.push({ key: childSnapshot.key, ...childSnapshot.val() });
      }
    });
    renderBulletinBoards(boards);
    renderPagination(boards.length);
  });
});

// Initial fetch
fetchBulletinBoards(currentPage);

// 사이드 메뉴

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
    const storageRef = firebase.storage().ref(`profileImages/${user.uid}`);
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
