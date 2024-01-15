document.getElementById('submit').onclick = function () {
  let pPos = document.getElementById('p_pos').value;
  let pNeg = document.getElementById('p_neg').value;
  console.log(pPos);
  console.log(pNeg);

  Swal.fire({
    title: 'generating!',
    html: 'Please waiting for a min ...',

    didOpen: () => {
      Swal.showLoading();
      gen({ pos: pPos, neg: pNeg })
        .then((res) => {
          // const json = res
          console.log(res.status);
          // console.log(res);
          res.arrayBuffer().then((buffer) => {
            var base64Flag = 'data:image/png;base64,';
            var imageStr = arrayBufferToBase64(buffer);

            document.querySelector('img').src = base64Flag + imageStr;
            Swal.close();
          });
        })
        .catch(console.error);
    },
  });
  // .then((result) => {});
};

async function gen(data) {
  const url = 'https://api.mfunct.com/gen';
  return await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach((b) => (binary += String.fromCharCode(b)));

  return window.btoa(binary);
}
