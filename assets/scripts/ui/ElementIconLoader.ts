import { assetManager, SpriteFrame } from 'cc';

const iconCache = new Map<string, SpriteFrame>();

let elementsBundlePromise: Promise<any> | null = null;

function loadElementsBundle(): Promise<any | null> {
  if (!elementsBundlePromise) {
    elementsBundlePromise = new Promise((resolve) => {
      assetManager.loadBundle('elements', (err, bundle) => {
        if (err || !bundle) {
          // 静默失败：不 reject
          console.warn('[IconLoader] elements bundle unavailable');
          resolve(null);
          return;
        }
        resolve(bundle);
      });
    });
  }
  return elementsBundlePromise;
}

/**
 * slug 直接传：element-chaos / element-water
 */
export function loadElementIcon(
  slug: string,
  cb: (frame: SpriteFrame | null) => void
) {
  const assetPath = slug;

  const cached = iconCache.get(assetPath);
  if (cached) {
    cb(cached);
    return;
  }

  loadElementsBundle().then((bundle) => {
    if (!bundle) {
      // bundle 都没，不报错，直接回 null
      cb(null);
      return;
    }

    bundle.load(
      `${assetPath}/spriteFrame`,
      SpriteFrame,
      (err: any, sf: SpriteFrame) => {
        if (err || !sf) {
          // 关键点：静默失败
          // 不 console.error
          cb(null);
          return;
        }

        iconCache.set(assetPath, sf);
        cb(sf);
      }
    );
  });
}
