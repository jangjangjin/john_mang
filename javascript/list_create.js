// create.js

const db = firebase.database();
const storage = firebase.storage();
const auth = firebase.auth();
const boardForm = document.getElementById("board-form");

boardForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const file = document.getElementById("image-upload").files[0];

  auth.onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      if (file) {
        const storageRef = storage.ref(`images/${file.name}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress function (optional)
          },
          (error) => {
            console.error("Error uploading image:", error);
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              saveBulletinBoard(userId, title, content, downloadURL);
            });
          }
        );
      } else {
        saveBulletinBoard(userId, title, content, null);
      }
    } else {
      console.error("User is not logged in.");
    }
  });
});

function saveBulletinBoard(userId, title, content, imageUrl) {
  const newBoardRef = db.ref("bulletinBoards").push();
  newBoardRef
    .set({
      userId,
      title,
      content,
      imageUrl,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    })
    .then(() => {
      window.location.href = "list.html";
    })
    .catch((error) => {
      console.error("Error saving bulletin board:", error);
    });
}
