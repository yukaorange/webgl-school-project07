import { useContext, useState } from "react";
import { NightModeContext } from "@/components/nightModeContext";
import useSmoothScroll from "@/components/smoothScroll";

import BackButton from "@/components/backButton";
import Container from "@/components/container";
import Meta from "@/components/meta";
import { useEffect, useRef } from "react";
import { Sketch } from "@/js/creative01";
import Image from "next/image";
import Link from "next/link";

import pageOGP from "images/ogp2.jpg";

import ButtonBox from "@/components/buttonBox";

import styles from "@/scss/creative-section01.module.scss";

import irust01 from "public/girls/girls01.png";
import irust02 from "public/girls/girls02.png";
import irust03 from "public/girls/girls03.png";
import irust04 from "public/girls/girls04.png";
import irust05 from "public/girls/girls05.png";
import irust06 from "public/girls/girls06.png";
import irust07 from "public/girls/girls07.png";
import irust08 from "public/girls/girls08.png";
import irust09 from "public/girls/girls09.png";
import irust10 from "public/girls/girls10.png";

export default function Section01() {
  const { nightMode, setNightMode } = useContext(NightModeContext);

  const irusts = [
    {
      id: 1,
      image: irust01,
      title: "sample",
      text: "sampletext",
    },
    {
      id: 2,
      image: irust02,
      title: "sample",
      text: "sampletext",
    },
    {
      id: 3,
      image: irust03,
      title: "sumple",
      text: "sampletext",
    },
    {
      id: 4,
      image: irust04,
      title: "Creative",
      text: "sampletext",
    },
    {
      id: 5,
      image: irust05,
      title: "Creative",
      text: "sampletext",
    },
    {
      id: 6,
      image: irust06,
      title: "Creative",
      text: "sampletext",
    },
    {
      id: 7,
      image: irust07,
      title: "Creative",
      text: "sampletext",
    },
    {
      id: 8,
      image: irust08,
      title: "Creative",
      text: "sampletext",
    },
    {
      id: 9,
      image: irust09,
      title: "Creative",
      text: "sampletext",
    },
    {
      id: 10,
      image: irust10,
      title: "Creative",
      text: "sampletext",
    },
  ];

  const containerRef = useRef(); //この時点でcontainerRef.currentの値はnull、ref={container}のdomがレンダリングされた際に、その要素への参照がcontainerRef.currentに保存される
  const imageRefs = useRef([]); //この時点でimageRefsは空配列、Imageポーネントがレンダリングされた際に、addToRefs関数が実行され、imageRefsに無い要素が追加される。引数のelはImageポーネントのdom要素。

  const addToRefs = (el) => {
    if (el && !imageRefs.current.includes(el)) {
      imageRefs.current.push(el);
    }
  };

  useEffect(() => {
    setNightMode(true);
    return () => {
      setNightMode(false);
    };
  }, []);

  useEffect(() => {
    const sketch = new Sketch({
      dom: containerRef.current,
      images: imageRefs.current,
    });
  }, []);

  useSmoothScroll();

  return (
    <>
      <Meta
        pageImg={pageOGP.src}
        pageImgW={pageOGP.width}
        pageImgH={pageOGP.height}
      />
      {/* webGL */}
      <div id="container" ref={containerRef} className={styles.container}>
        <div id="slider"></div>
      </div>
      {/* content */}
      <Container section={true}>
        <div className={styles.content}>
          <ul className={styles.cards}>
            {irusts.map((data, index) => {
              return (
                <li key={data.id} className={styles.card}>
                  <div className={styles.card__inner}>
                    <div className={styles.card__thumbnail}>
                      <Image
                        ref={addToRefs}
                        src={data.image}
                        alt="irusts"
                        width={500}
                        height={500}
                      />
                    </div>
                    <h3 className={styles.card__title}>{data.title}</h3>
                    <p className={styles.card__text}>{data.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>

      {/* 戻るボタンを設置 */}
      <ButtonBox>
        <BackButton />
      </ButtonBox>
    </>
  );
}
