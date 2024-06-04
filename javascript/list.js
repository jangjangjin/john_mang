// Firebase 데이터베이스 및 인증 객체 생성
const boardsRef = db.ref("bulletinBoards");
const usersRef = db.ref("사용자들");
const storageRef = firebase.storage().ref(); // Firebase 스토리지에 대한 레퍼런스

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
