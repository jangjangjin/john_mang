// 데이터 가져오는 부분 ----------------------------------

// 데이터베이스에서 CPU 데이터 가져오기
function fetchCpuData() {
  const cpuRef = db.ref("부품/0/CPU");
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
    .getElementById("cpuTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // 기존 데이터 초기화

  data.forEach((cpu) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = cpu["Name"];
    row.appendChild(nameCell);

    const manufacturerCell = document.createElement("td");
    manufacturerCell.textContent = cpu["제조사"];
    row.appendChild(manufacturerCell);

    const memoryCell = document.createElement("td");
    memoryCell.textContent = cpu["메모리 규격"];
    row.appendChild(memoryCell);

    const socketCell = document.createElement("td");
    socketCell.textContent = cpu["소켓"];
    row.appendChild(socketCell);
    console.log(cpu["소켓"]);
    const BiGraphicsCell = document.createElement("td");
    BiGraphicsCell.textContent = cpu["내장그래픽 여부"];
    row.appendChild(BiGraphicsCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = cpu["가격"];
    row.appendChild(priceCell);

    tableBody.appendChild(row);
  });
}

// 페이지 로드 시 CPU 데이터 가져오기
window.onload = fetchCpuData;