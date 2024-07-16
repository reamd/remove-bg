# <div align="center"><img src="src/assets/img/remove-bg_logo.png" width=450/></div>

### <div align="center"><b>English | <a href="README_CN.md">简体中文</a></b></div>

<div align="center">

[![download](https://img.shields.io/github/downloads/reamd/remove-bg/total.svg)](https://github.com/reamd/remove-bg/releases)
[![Open issue](https://img.shields.io/github/issues/reamd/remove-bg)](https://github.com/reamd/remove-bg/issues)
[![Closed issue](https://img.shields.io/github/issues-closed/reamd/remove-bg)](https://github.com/reamd/remove-bg/issues)
[![LICENSE](https://img.shields.io/badge/License-GPL%203.0-blue.svg)](https://github.com/reamd/remove-bg/blob/master/LICENSE)

</div>

> :rocket:A free, open-source tool powered by WebGPU and WebAssembly (WASM) in the browser, efficiently removes backgrounds from images without any additional costs or privacy concerns.

<div align="center">
<img src="src/assets/img/example.png" width=600/>
</div>

### Demo link

[https://remove-bg.djfos.fun](https://remove-bg.djfos.fun)

## :computer:How to use

### Locally

1. Clone this repository

```bash
git clone https://github.com/reamd/remove-bg.git
cd remove-bg
```

2. Install dependencies

```bash
npm install
```

3. Start web-application

```bash
npm run start
```

### Docker

```bash
docker run -d -p 8080:80 --name remove-bg reamd/remove-bg:latest
```

## :star:Contact

If you have any question, please follow me on X:

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/DJ_wilderness)](https://x.com/DJ_wilderness)

## :information_desk_person:Acknowledgements

Model: [xuebinqin/U-2-Net](https://github.com/xuebinqin/U-2-Net)

### BibTeX

```
@InProceedings{Qin_2020_PR,
title = {U2-Net: Going Deeper with Nested U-Structure for Salient Object Detection},
author = {Qin, Xuebin and Zhang, Zichen and Huang, Chenyang and Dehghan, Masood and Zaiane, Osmar and Jagersand, Martin},
journal = {Pattern Recognition},
volume = {106},
pages = {107404},
year = {2020}
}
```
