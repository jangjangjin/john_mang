// 데이터 가져오는 부분 ----------------------------------

// 데이터베이스에서 CPU 데이터 가져오기
function fetchCpuData() {
  const cpuRef = db.ref("부품/0/MBoard");
  cpuRef.once("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      displayCpuData(data);
    } else {
      console.log("No data available");
    }
  });
}

// CPU 데이터를 테이블에 표시하기
function displayCpuData(data) {
  const tableBody = document
    .getElementById("MBoardTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // 기존 데이터 초기화

  data.forEach((MBoard) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = MBoard["이름"];
    row.appendChild(nameCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = MBoard["가격"];
    row.appendChild(priceCell);

    const socketCell = document.createElement("td");
    socketCell.textContent = MBoard["소켓"];
    row.appendChild(socketCell);

    tableBody.appendChild(row);
  });
}

// 페이지 로드 시 CPU 데이터 가져오기
window.onload = fetchCpuData;
