// 데이터 가져오는 부분 ----------------------------------

// 데이터베이스에서 CPU 데이터 가져오기
function fetchCpuData() {
  const cpuRef = db.ref("부품/0/Power");
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
    .getElementById("PowerTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // 기존 데이터 초기화

  data.forEach((Power) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = Power["이름"];
    row.appendChild(nameCell);

    const factCell = document.createElement("td");
    factCell.textContent = Power["제조사"];
    row.appendChild(factCell);

    const power_vol = document.createElement("td");
    power_vol.textContent = Power["파워용량"];
    row.appendChild(power_vol);

    const priceCell = document.createElement("td");
    priceCell.textContent = Power["가격"];
    row.appendChild(priceCell);

    tableBody.appendChild(row);
  });
}

// 페이지 로드 시 CPU 데이터 가져오기
window.onload = fetchCpuData;
