export class Loading {
  constructor(elements, log, progress) {
    this.lengthArray = []
    this.loadedArray = []
    this.sumLength = 0
    this.sumLoaded = 0
    this.log = log
    this.progress = progress
    this.init(elements)
  }

  async init(elements) {
    //初めに全ての画像のContent-Lengthの値を取得する
    this.lengthArray = await Promise.all(
      [...elements].map(async (elm) => {
        return this.getLength(elm.dataset.src)
      }),
    )

    this.loadedArray = [...Array(this.lengthArray.length)].map(() => 0)
    this.sumLength = this.sum(this.lengthArray)
    this.sumLoaded = this.sum(this.loadedArray)
    this.addLog(`合計 ${this.sum(this.lengthArray)} bytes のデータ`)

    //画像をロードする
    // elements.forEach((elm, index) => {
    //   this.loadXHR(elm, index);
    // });
    for (let i = 0; i < elements.length; i++) {
      setTimeout(
        () => {
          this.loadXHR(elements[i], i)
        },
        `${i * 100}`,
      )
      console.log(`画像読み込み${i + 1}枚目完了`)
    }
  }

  sum(array) {
    return array.reduce(function (a, b) {
      return a + b
    }, 0)
  }

  updateProgress(e, index) {
    this.loadedArray[index] = e.loaded
    this.sumLoaded = this.sum(this.loadedArray)
    const percent = (this.sumLoaded / this.sumLength) * 100
    // this.progress.setAttribute("style", `width:${percent}%`);
    this.progress.textContent = `now loading...${Math.floor(percent)}%`
    this.addLog(`${e.type}: ${this.sumLoaded} bytes 受信済み`)
    if (percent === 100) {
      document.body.classList.add('loaded')
      console.log('ロード完了→アニメーション発火')
    }
  }

  addLog(text) {
    this.log.textContent = `${this.log.textContent}${text}\n`
  }

  addListeners(xhr, elm, index) {
    xhr.addEventListener('loadstart', (e) => {
      this.updateProgress(e, index)
    })
    xhr.addEventListener('load', (e) => {
      this.updateProgress(e, index)
    })
    xhr.addEventListener('progress', (e) => {
      this.updateProgress(e, index)
    })
    xhr.addEventListener('error', (e) => {
      this.updateProgress(e, index)
    })
    xhr.addEventListener('abort', (e) => {
      this.updateProgress(e, index)
    })
    xhr.addEventListener('loadend', (e) => {
      this.updateProgress(e, index)
      if (xhr.readyState === xhr.DONE && xhr.status === 200) {
        //blobで読み込む場合
        //elm.src = URL.createObjectURL(xhr.response);

        //キャッシュがあるのでsrcにパスを書くだけでも問題なさそう（体感的な表示速度の違いが感じられない）
        elm.src = elm.dataset.src

        this.addLog(`${index + 1} 枚目の画像の読み込みが完了`)

        if (this.sumLength === this.sumLoaded) {
          this.addLog('全ての画像のロード完了（描画が完了したわけではない）')
        }
      }
    })
  }

  getLength(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === xhr.HEADERS_RECEIVED) {
          //レスポンスヘッダからContent-Lengthの値を読み取る
          const contentLength = parseInt(xhr.getResponseHeader('Content-Length'))

          //ヘッダのみで、データの読み込みは行わない
          xhr.abort()

          resolve(contentLength)
        }
      })
      xhr.addEventListener('error', () => {
        reject(0)
      })
      xhr.open('GET', url)
      xhr.send()
    })
  }

  loadXHR(elm, index) {
    const xhr = new XMLHttpRequest()
    //blobで読み込む場合
    //xhr.responseType = 'blob';
    this.addListeners(xhr, elm, index)
    xhr.open('GET', elm.dataset.src)
    xhr.send()
  }
}
