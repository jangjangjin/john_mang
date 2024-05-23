// 파이어베이스 인증, DB 객체 초기화
const auth = firebase.auth();
const db = firebase.database();

// 로딩 창 표시 함수
function showLoading() {
  document.getElementById("loading").style.display = "flex";
}

// 로딩 창 숨기기 함수
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// 오류 메시지 표시 함수
// 버튼 위 빨간 글씨로 알려주는 함수
function showError(message) {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
}

// 오류 메시지 숨기기 함수
function hideError() {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = "";
  errorMessageDiv.style.display = "none";
}

// 성공 모달 표시 함수
function showSuccessModal(message) {
  const modal = document.getElementById("success-modal");
  const closeBtn = document.getElementsByClassName("close-btn")[0];
  const successMessage = document.getElementById("error-message");
  successMessage.textContent = message;
  modal.style.display = "flex";
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// 회원가입 처리
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  hideError();

  const nickname = document.getElementById("signup-nickname").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const passwordConfirm = document.getElementById(
    "signup-password-confirm"
  ).value;

  if (password !== passwordConfirm) {
    showError("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (password.length < 6) {
    showError("비밀번호는 6자 이상이어야 합니다.");
    return;
  }

  showLoading();

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      db.ref("사용자들/" + user.uid).set({
        nickname: nickname,
        email: email,
      });
      showSuccessModal("회원가입이 성공적으로 완료되었습니다!");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000); // 2초 후에 이동
    })
    .catch((error) => {
      console.error("회원가입 오류:", error);
      if (error.code === "auth/email-already-in-use") {
        showError("이미 사용 중인 이메일입니다. 다른 이메일을 사용해 주세요.");
      } else {
        showError("회원가입 실패: 이메일이나, 비밀번호를 다시 확인해주세요.!");
      }
    })
    .finally(() => {
      hideLoading();
    });
});

// 돌아가기 버튼 클릭 시 login.html로 이동
document.getElementById("go-back").addEventListener("click", () => {
  window.location.href = "../index.html";
});
