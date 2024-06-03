// 슬라이드쇼 부분 -----------------------------------

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
