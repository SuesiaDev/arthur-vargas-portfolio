import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060708',
          color: '#edf1f5',
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: -4,
          position: 'relative',
        }}
      >
        AV
        <div
          style={{
            position: 'absolute',
            right: 30,
            bottom: 30,
            width: 14,
            height: 14,
            borderRadius: 14,
            background: '#74d0dc',
            display: 'flex',
          }}
        />
      </div>
    ),
    size,
  );
}
