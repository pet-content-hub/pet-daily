<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="cat-loader">
        <div class="cat-body">
          <div class="cat-head">
            <div class="cat-ears">
              <div class="ear ear-left"></div>
              <div class="ear ear-right"></div>
            </div>
            <div class="cat-face">
              <div class="eyes">
                <div class="eye eye-left"></div>
                <div class="eye eye-right"></div>
              </div>
              <div class="nose"></div>
              <div class="mouth"></div>
            </div>
          </div>
          <div class="cat-tail"></div>
        </div>
      </div>
      <p class="loading-text">加载中...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 249, 250, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-content {
  text-align: center;
}

.cat-loader {
  width: 80px;
  height: 60px;
  margin: 0 auto 1rem;
  position: relative;
}

.cat-body {
  width: 40px;
  height: 30px;
  background: var(--primary-color);
  border-radius: 20px;
  position: relative;
  animation: cat-bounce 1.5s ease-in-out infinite;
}

.cat-head {
  width: 30px;
  height: 25px;
  background: var(--primary-color);
  border-radius: 50%;
  position: absolute;
  top: -15px;
  left: 5px;
}

.cat-ears {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
}

.ear {
  width: 8px;
  height: 10px;
  background: var(--primary-color);
  border-radius: 50% 50% 0 0;
  position: absolute;
  
  &.ear-left {
    left: -6px;
    transform: rotate(-20deg);
  }
  
  &.ear-right {
    right: -6px;
    transform: rotate(20deg);
  }
}

.cat-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.eyes {
  display: flex;
  gap: 6px;
  margin-bottom: 3px;
}

.eye {
  width: 3px;
  height: 3px;
  background: white;
  border-radius: 50%;
  animation: cat-blink 2s ease-in-out infinite;
}

.nose {
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  margin: 0 auto 2px;
}

.mouth {
  width: 8px;
  height: 4px;
  border: 1px solid white;
  border-top: none;
  border-radius: 0 0 8px 8px;
  margin: 0 auto;
}

.cat-tail {
  width: 3px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50px;
  position: absolute;
  right: -5px;
  top: 5px;
  transform-origin: top;
  animation: cat-tail-wag 1s ease-in-out infinite alternate;
}

.loading-text {
  color: var(--text-dark);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  animation: loading-fade 1.5s ease-in-out infinite;
}

@keyframes cat-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes cat-blink {
  0%, 90%, 100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

@keyframes cat-tail-wag {
  0% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(20deg);
  }
}

@keyframes loading-fade {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>