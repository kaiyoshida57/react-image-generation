import React from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://api.openai.com/v1/';
const API_KEY = process.env.REACT_APP_KEY;

function App() {

  // 画像データ
  const [ imageData, setImageData ] = useState( '' );
  // ローディング表示のフラグ
  const [ isLoading, setIsLoading ] = useState( false );
  // プロンプト
  const [ prompt, setPrompt ] = useState( '' );
  // エラー情報
  const [ error, setError ] = useState( '' );
  // 受け取る画像のフォーマット
  const [ format, setFormat ] = useState( 'b64_json' );
  // 生成する画像のサイズ
  const [ generateSize, setGenerateSize ] = useState( '512x512' );
  const [ imageSize, setImageSize ] = useState( 512 );


  const imageSizes : { [key: string]: number }  = {
    "256x256": 256,
    "512x512": 512,
    "1024x1024": 1024
  };

  // 画像生成・取得を行う関数
  // - format, generateSize, promptが更新された時のみ再レンダリングされるようにする。
  const generateImage = useCallback( async() => {

    if ( !prompt ) {
      alert( 'プロンプトがありません。' );
      return;
    }

    if ( isLoading ) return;

    setIsLoading( true );

    try {
      // APIリクエスト
      const response = await axios.post(
        `${ API_URL }images/generations`,
        {
          prompt, // 生成したい画像に関する説明。英語。例。「: 'two puppies, cute, playing in the park'」
          n: 1, // 取得する枚数
          size: generateSize,
          response_format: format, // 取得する画像のフォーマット（URL or Base64）
        },
        {
          // ヘッダー（認証情報）
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ API_KEY}`
          }
        }
      );

      // 画像データの保持
      setImageData( response.data.data[0][ format ] );

    } catch ( error: any ) {
      // エラーハンドリング
      console.log( error.message );
      setError( error.toString() );
    } finally {
      // 最後に表示される処理
      setIsLoading(false);
    }

  }, [ format, generateSize, prompt ] );

  useEffect(() => {
    setImageSize( imageSizes[ generateSize ] );
  }, [ generateSize ] );

  return (
    <div className="App">
      <div className="container">
        <p className="text">
          ここではAI画像を生成できます。<br />
          何か文字を英語で入力してみてください。
        </p>
        <div className="generate-form">
          <textarea
            value={ prompt }
            cols={40}
            maxLength={1000}
            onChange={
              e => {
                setPrompt( e.target.value ); // プロンプトの更新
              }
            }
            placeholder='入力してください'
          >
          </textarea>
          <select
            onChange={ e => setGenerateSize( e.target.value ) } // 生成サイズの更新
            value={ generateSize }
          >
            <option value="256x256">256 x 256</option>
            <option value="512x512">512 x 512</option>
            <option value="1024x1024">1024 x 1024</option>
          </select>
          <select
            onChange={ e => setFormat( e.target.value )  } // フォーマットの更新
            value={ format }
          >
            <option value="url">URL</option>
            <option value="b64_json">Base64</option>
          </select>
          <button
            onClick={ generateImage } // 画像生成
            disabled={ isLoading }
          >
            { isLoading ? '作成中...' : '画像作成' }
          </button>
        </div>

        {/* エラーの場合 */}
        { error && (
          <div className='error-message'>
            <pre>{ error }</pre>
          </div>
        ) }
        {/* 画像データがあれば */}
        {
          imageData && (
            <div className="generated-image-area">
              <figure>
                <img
                  src={ format === 'b64_json'
                    ? `data:image/png;base64, ${ imageData }`
                    : imageData // URLの場合
                  }
                  alt=""
                  width={ imageSize }
                  height={ imageSize }
                />
              </figure>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;
