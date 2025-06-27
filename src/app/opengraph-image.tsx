import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'richen.sh'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // Load the Gohu font
  const gohuFont = fetch(
    new URL('../../public/Gohu.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
          fontSize: 60,
          fontWeight: 400,
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Scanline effect overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Terminal prompt */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            textShadow: '0 0 1px rgba(255, 255, 255, 0.5)',
            zIndex: 1,
          }}
        >
          <span style={{ color: '#888', marginRight: 20, fontSize: 90 }}>&gt;</span>
          <span style={{ fontSize: 90 }}>richen.sh</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: '#888',
            marginTop: 30,
            textShadow: '0 0 1px rgba(255, 255, 255, 0.5)',
            zIndex: 1,
          }}
        >
          rm -rf /
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Gohu',
          data: await gohuFont,
          style: 'normal',
        },
      ],
    }
  )
} 