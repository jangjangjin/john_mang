// Firebase 데이터베이스 및 인증 객체 생성
const db = firebase.database();
const boardsRef = db.ref("bulletinBoards");
const commentsRef = db.ref("comments");
const usersRef = db.ref("사용자들"); // 사용자 데이터에 대한 레퍼런스
const storageRef = firebase.storage().ref(); // Firebase 스토리지에 대한 레퍼런스
const auth = firebase.auth(); // Firebase 인증에 대한 레퍼런스

// URL에서 게시물 ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get("id");

// 게시물 세부 정보를 렌더링하는 함수
function renderArticleDetail(board) {
  // HTML 요소들을 가져옴
  const detailHeaderTitle = document.getElementById("detail_header_title");
  const articleDetail = document.getElementById("article-detail");
  const userId = board.userId; // 게시물 작성자 ID

  // 현재 사용자의 인증 상태를 확인하고, 게시물 작성자 정보를 가져옴
  auth.onAuthStateChanged((currentUser) => {
    usersRef.child(userId).once("value", (userSnapshot) => {
      const user = userSnapshot.val();
      const username = user ? user.nickname : "Unknown User"; // 작성자 이름 또는 "Unknown User"
      const createdAt = new Date(board.createdAt).toLocaleString(); // 작성일시를 지역 시간 문자열로 변환

      // 게시물 세부 정보를 HTML로 렌더링
      detailHeaderTitle.innerHTML = `${board.title}`; // 게시물 제목
      articleDetail.innerHTML = `
        <p>
          작성자: ${username} &nbsp;&nbsp;
          <span style="text-align: center;">작성일 : ${createdAt}</span>
          <span style="float: right;">조회수 : <span id="view-count">${board.views || 0}</span> &nbsp;&nbsp; 추천수 : <span id="recommend-count">${board.recommendations || 0}</span></span>
        </p>
        <p>${board.content}</p>
        ${board.imageUrl ? `<img src="${board.imageUrl}" alt="Bulletin Image" style="max-width: 500px; max-height: 500px;" />` : ""}
      `;

      // 추천 버튼을 articleDetail 요소 뒤에 추가합니다.
      articleDetail.insertAdjacentHTML('afterend', '<div id="recommend-btn-container"><button id="recommend-btn">추 천</button></div>');

      // 현재 사용자가 게시물 작성자인 경우 수정 및 삭제 버튼 표시
      if (currentUser && currentUser.uid === userId) {
        articleDetail.innerHTML += `
          <button id="edit-btn">수정</button>
          <button id="delete-btn">삭제</button>
        `;

        // 수정 버튼 클릭 시 수정 모달 열기
        document.getElementById("edit-btn").addEventListener("click", () => {
          openEditModal(board);
        });

        // 삭제 버튼 클릭 시 게시물 삭제
        document.getElementById("delete-btn").addEventListener("click", () => {
          deletePost(boardId);
        });
      }

      // 추천 버튼 클릭 시 이벤트 처리
      document.getElementById("recommend-btn").addEventListener("click", () => {
        recommendBoard(boardId);
      });
    });
  });

  // 조회수 업데이트
  updateViewsCount(boardId, board.views || 0);
}

// 게시물 수정 모달 열기 함수
function openEditModal(board) {
  // 모달과 관련된 요소들 가져오기
  const modal = document.getElementById("edit-modal");
  const closeBtn = document.querySelector(".close-btn");
  const editTitle = document.getElementById("edit-title");
  const editContent = document.getElementById("edit-content");
  const editImage = document.getElementById("edit-image");
  const editImagePreview = document.getElementById("edit-image-preview");

  // 모달 내용 초기화
  initModalContent(board, editTitle, editContent, editImage, editImagePreview);

  // 모달 열기
  modal.style.display = "block";

  // 모달 닫기 버튼 이벤트 처리
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // 모달 외부 클릭 시 닫기
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // 수정 폼 제출 이벤트 처리
  document.getElementById("edit-form").onsubmit = function (e) {
    e.preventDefault();
    const newTitle = editTitle.value;
    const newContent = editContent.value;
    const newImage = editImage.files[0];
    updatePost(boardId, newTitle, newContent, newImage, board.imageUrl);
  };
}

// 모달 컨텐츠 초기화 함수
function initModalContent(board, editTitle, editContent, editImage, editImagePreview) {
  editTitle.value = board.title; // 제목 입력 필드 초기화
  editContent.value = board.content; // 내용 입력 필드 초기화

  if (board.imageUrl) {
    editImagePreview.src = board.imageUrl; // 이미지 미리보기 초기화
    editImagePreview.style.display = "block"; // 이미지 미리보기 보이기
  } else {
    editImagePreview.style.display = "none"; // 이미지 미리보기 숨기기
  }
}

// 게시물 업데이트 함수
function updatePost(boardId, title, content, imageFile, prevImageUrl) {
  // 이미지 파일이 있을 경우 이미지 업로드 및 업데이트
  if (imageFile) {
    const imageUrl = `images/${boardId}/${imageFile.name}`;
    const imageRef = storageRef.child(imageUrl);
    imageRef.put(imageFile).then((snapshot) => {
      snapshot.ref.getDownloadURL().then((downloadURL) => {
        updatePostData(boardId, title, content, downloadURL);
      });
    });
  } else {
    // 이미지 파일이 없을 경우 단순 정보 업데이트
    updatePostData(boardId, title, content, prevImageUrl);
  }
}

// 게시물 데이터 업데이트 함수
function updatePostData(boardId, title, content, imageUrl) {
  // 게시물 업데이트 및 화면 갱신
  boardsRef.child(boardId).update({ title, content, imageUrl }).then(() => {
    boardsRef.child(boardId).once("value", (snapshot) => {
      const board = snapshot.val();
      if (board) {
        renderArticleDetail(board); // 게시물 세부 정보 다시 렌더링
        document.getElementById("edit-modal").style.display = "none"; // 모달 닫기
      }
    });
  }).catch((error) => {
    console.error("Error updating post:", error);
  });
}

// 게시물 삭제 함수
function deletePost(boardId) {
  if (confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
    boardsRef.child(boardId).remove().then(() => {
      alert("게시물이 성공적으로 삭제되었습니다.");
      window.location.href = "list.html"; // 리스트 페이지로 리다이렉트
    }).catch((error) => {
      console.error("Error deleting post:", error);
    });
  }
}

// 게시물 추천 함수
function recommendBoard(boardId) {
  boardsRef.child(boardId).transaction((board) => {
    if (board) {
      board.recommendations = (board.recommendations || 0) + 1; // 추천 수 증가
    }
    return board;
  }).then(() => {
    boardsRef.child(boardId).once("value", (snapshot) => {
      const board = snapshot.val();
      if (board) {
        document.getElementById("recommend-count").innerText = board.recommendations || 0; // 추천 수 업데이트
      }
    });
  }).catch((error) => {
    console.error("Error recommending board:", error);
  });
}

// 초기 댓글 및 게시물 정보 가져오기 및 렌더링
function fetchCommentsAndRenderBoardDetails() {
  // 게시물 정보 가져오기
  boardsRef.child(boardId).once("value", (snapshot) => {
    const board = snapshot.val();
    if (board) {
      renderArticleDetail(board); // 게시물 세부 정보 렌더링
    }
  });

  // 댓글 정보 가져오기
  fetchComments(boardId);
}

// 댓글 추가 함수
function addComment(boardId, userId, content) {
  const newCommentRef = commentsRef.push();
  newCommentRef.set({
    boardId,
    userId,
    content,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    recommendations: 0,
  }).then(() => {
    // 댓글 추가 후 댓글 목록 새로고침
    document.getElementById("comment-content").value = ""; // 댓글 입력 필드 초기화
    fetchComments(boardId); // 댓글 목록 다시 가져오기
  }).catch((error) => {
    console.error("Error adding comment:", error);
  });
}

// 댓글 가져오기 및 렌더링
function fetchComments(boardId) {
  commentsRef.orderByChild("boardId").equalTo(boardId).once("value", (snapshot) => {
    const commentsList = document.getElementById("comments-list");
    commentsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const comment = childSnapshot.val();
      renderComment(comment, childSnapshot.key); // 댓글 렌더링
    });
  });
}

// 댓글 렌더링 함수
function renderComment(comment, commentId) {
  const commentsList = document.getElementById("comments-list");
  const commentItem = document.createElement("div");
  commentItem.className = "comment-item";
  const userId = comment.userId;

  // 사용자 정보 가져오기
  usersRef.child(userId).once("value", (userSnapshot) => {
    const user = userSnapshot.val();
    const username = user ? user.nickname : "Unknown User"; // 사용자 닉네임 또는 "Unknown User"
    const createdAt = new Date(comment.createdAt).toLocaleString(); // 작성일시를 지역 시간 문자열로 변환

    // 댓글 항목 렌더링
    commentItem.innerHTML = `
      <div class="comment-meta">
        <p style="display: inline;">작성자: ${username} &nbsp;&nbsp; 작성일 ${createdAt}</p>
        <button class="recommend-comment-btn" data-id="${commentId}" style="display: inline; margin-left: 10px;">추천</button>
        &nbsp; 추천수 : <span id="comment-recommend-count-${commentId}" style="display: inline;">${comment.recommendations ? comment.recommendations : 1}</span>
      </div>
      <br>
      <p>${comment.content}</p>
    `;

    // 댓글 추천 버튼 클릭 이벤트 처리
    commentItem.querySelector(".recommend-comment-btn").addEventListener("click", (e) => {
      recommendComment(e.target.getAttribute("data-id"));
    });

    // 댓글 목록에 추가
    commentsList.appendChild(commentItem);
  });
}

// 댓글 추천 함수
function recommendComment(commentId) {
  commentsRef.child(commentId).transaction((comment) => {
    if (comment) {
      comment.recommendations = (comment.recommendations || 0) + 1; // 추천 수 증가
    }
    return comment;
  }).then(() => {
    // 추천 후 추천 수 업데이트
    commentsRef.child(commentId).once("value", (snapshot) => {
      const comment = snapshot.val();
      if (comment) {
        document.getElementById(`comment-recommend-count-${commentId}`).innerText = comment.recommendations || 0;
      }
    });
  }).catch((error) => {
    console.error("Error recommending comment:", error);
  });
}

// 초기 댓글 및 게시물 정보 가져오기 및 렌더링
fetchCommentsAndRenderBoardDetails();
