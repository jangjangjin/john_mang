// 데이터 가져오는 부분 ----------------------------------

// 데이터베이스에서 CPU 데이터 가져오기
function fetchCpuData() {
  const cpuRef = db.ref("부품/0/RAM");
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
    .getElementById("RAMTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // 기존 데이터 초기화

  data.forEach((RAM) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = RAM["Name"];
    row.appendChild(nameCell);

    const standardCell = document.createElement("td");
    standardCell.textContent = RAM["규격"];
    row.appendChild(standardCell);

    const volumeCell = document.createElement("td");
    volumeCell.textContent = RAM["용량"];
    row.appendChild(volumeCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = RAM["가격"];
    row.appendChild(priceCell);

    tableBody.appendChild(row);
  });
}

// 페이지 로드 시 CPU 데이터 가져오기
window.onload = fetchCpuData;
