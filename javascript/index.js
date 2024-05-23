// 파이어베이스 인증 객체 초기화
const auth = firebase.auth();

// 로딩 창 표시 함수
function showLoading() {
  document.getElementById("loading").style.display = "flex";
}

// 로딩 창 숨기기 함수
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

// 오류 메시지 표시 함수
function showError(message, errorElementId) {
  const errorMessageDiv = document.getElementById(errorElementId);
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
}

// 오류 메시지 숨기기 함수
function hideError(errorElementId) {
  const errorMessageDiv = document.getElementById(errorElementId);
  errorMessageDiv.textContent = "";
  errorMessageDiv.style.display = "none";
}

// 성공 모달 표시 함수
function showSuccessModal(message) {
  const modal = document.getElementById("success-modal");
  const closeBtn = document.getElementsByClassName("close-btn")[0];
  const successMessage = document.getElementById("success-message");
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

// 로그인 처리
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  hideError("login-error-message");

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  showLoading();

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      showSuccessModal("로그인에 성공했습니다!");
      window.location.href = "html/main.html";
    })
    .catch((error) => {
      showError(
        "로그인 실패: 이메일이나 비밀번호를 다시 확인하세요",
        "login-error-message"
      );
    })
    .finally(() => {
      hideLoading();
    });
});

// 회원가입 버튼 클릭 시 sign_up.html로 이동
document.getElementById("go-signup").addEventListener("click", () => {
  window.location.href = "html/sign_up.html";
});
