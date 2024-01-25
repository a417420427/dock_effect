const CUBE_MARGIN = 12
const CONTAINER_PADDING = 100
const DockPositions = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom',
}
class DockService {
  currentDockPosition = DockPositions.left
  /**
   * @type {HTMLElement}
   */
  container = null
  /**
   * 是否活动
   */
  activie = false
  /**
   * @type {HTMLElement[]}
   * 菜单元素
   */
  cubes = []
  /** 菜单元素及边界信息 */
  cubesWithOffset = []
  /** 菜单出现边界距离 */
  triggerDistance = 10
  /** 菜单隐藏边界距离 */
  leaveDistance = 100
  /** 外部容器宽高 */
  innerHeight = window.innerHeight
  innerWidth = window.innerWidth

  constructor() {
    console.log('init')
  }
  async init(container, cubes) {
    this.container = container
    this.cubes = cubes
    this.initContainerStyle()
    await sleep(100)
    const cubeWidth = this.getCubeWidth()
    this.cubes.forEach((cube) => {
      cube.style.width = cubeWidth + 'px'
      cube.style.height = cubeWidth + 'px'
      cube.style.margin = CUBE_MARGIN / 2 + 'px'
    })
    await sleep(100)
    this.cubesWithOffset = this.cubes.map((cube) => ({
      cube,
      offsetTop: cube.offsetTop,
      offsetLeft: cube.offsetLeft,
    }))
    this.listenMousePosition()
  }
  initContainerStyle() {
    const { innerHeight, innerWidth, container } = this
    switch (this.currentDockPosition) {
      case DockPositions.left:
        container.style.left = '10px'
        container.style.height = innerHeight * 0.8 + 'px'
        container.style.top = innerHeight * 0.1 + 'px'
        container.style.flexDirection = 'column'
        container.style.transformOrigin = '0 center'
        container.style.transform = 'scale(0.8) translateX(-200px)'
        container.style.removeProperty('width')
        container.style.removeProperty('bottom')
        break
      case DockPositions.bottom:
        container.style.bottom = '10px'
        container.style.width = innerWidth * 0.8 + 'px'
        container.style.left = innerWidth * 0.1 + 'px'
        container.style.flexDirection = 'row'
        container.style.transformOrigin = 'center top'
        container.style.transform = 'scale(0.8) translateY(200px)'
        container.style.alignItems = 'end'
        container.style.removeProperty('height')
        container.style.removeProperty('top')
        break
    }
  }
  /** 还原菜单大小 */
  revertCube() {
    const cubeWidth = this.getCubeWidth()
    this.cubes.forEach((cube) => {
      cube.style.width = cubeWidth + 'px'
      cube.style.height = cubeWidth + 'px'
    })
  }
  updateCubeOnLeft(e) {
    const originWidth = this.getCubeWidth()
    const cubeWidth = originWidth + CUBE_MARGIN
    const scaleWidth = cubeWidth * 2
    const clientY = e.clientY
    const top = this.container.offsetTop
    const scaleCubes = []
    this.cubesWithOffset.forEach((cubeWidthOffset) => {
      const distance = Math.abs(clientY - cubeWidthOffset.offsetTop - top)
      if (distance < cubeWidth * 3) {
        scaleCubes.push({
          cube: cubeWidthOffset.cube,
          distance: cubeWidth * 3 - distance,
        })
      } else {
        cubeWidthOffset.cube.style.width = originWidth + 'px'
        cubeWidthOffset.cube.style.height = originWidth + 'px'
      }
    })
    const allDistance = scaleCubes.reduce((pre, cur) => pre + cur.distance, 0)
    scaleCubes.forEach((cube) => {
      const width = cubeWidth + (cube.distance * scaleWidth) / allDistance + 'px'
      cube.cube.style.width = width
      cube.cube.style.height = width
    })
  }
  updateCubeOnBottom(e) {
    const originWidth = this.getCubeWidth()
    const cubeWidth = originWidth + CUBE_MARGIN
    const scaleWidth = cubeWidth * 2
    const clientX = e.clientX
    const top = this.container.offsetLeft
    const scaleCubes = []
    this.cubesWithOffset.forEach((cubeWidthOffset) => {
      const distance = Math.abs(clientX - cubeWidthOffset.offsetLeft - top)
      if (distance < cubeWidth * 3) {
        scaleCubes.push({
          cube: cubeWidthOffset.cube,
          distance: cubeWidth * 3 - distance,
        })
      } else {
        cubeWidthOffset.cube.style.width = originWidth + 'px'
        cubeWidthOffset.cube.style.height = originWidth + 'px'
      }
    })
    const allDistance = scaleCubes.reduce((pre, cur) => pre + cur.distance, 0)
    scaleCubes.forEach((cube) => {
      const width = cubeWidth + (cube.distance * scaleWidth) / allDistance + 'px'
      cube.cube.style.width = width
      cube.cube.style.height = width
    })
  }
  /**
   *
   * @param {MouseEvent} e
   */
  mousemoveListener(e) {
    switch (this.currentDockPosition) {
      case DockPositions.left:
        if (e.clientX < this.triggerDistance) {
          this.activie = true
          this.container.classList.add('active')
          this.updateCubeOnLeft(e)
        } else if (e.clientX < this.leaveDistance) {
          if (!this.activie) {
            return
          }
          this.updateCubeOnLeft(e)
        } else {
          if (this.activie) {
            this.activie = false
            this.container.classList.remove('active')
            setTimeout(() => {
              this.revertCube()
            }, 100)
          }
        }
        break
      case DockPositions.bottom:
        if (e.clientY > window.innerHeight - this.triggerDistance) {
          this.activie = true
          this.container.classList.add('active')
          this.updateCubeOnBottom(e)
        } else if (e.clientY > window.innerHeight - this.leaveDistance) {
          if (!this.activie) {
            return
          }
          this.updateCubeOnBottom(e)
        } else {
          if (this.activie) {
            this.activie = false
            this.container.classList.remove('active')
            setTimeout(() => {
              this.revertCube()
            }, 100)
          }
        }
        break
    }
  }
  listenMousePosition() {
    document.addEventListener('mousemove', this.mousemoveListener)
  }

  getCubeWidth() {
    const length = Math.max(this.container.clientHeight, this.container.clientWidth)
    const cubeWidth = (length - CONTAINER_PADDING) / this.cubes.length
    return cubeWidth - CUBE_MARGIN
  }

  onSwitchPosition(position) {
    this.container.classList.remove(this.currentDockPosition)
    this.currentDockPosition = position
    this.container.classList.add(this.currentDockPosition)
    setTimeout(() => {
      this.init(this.container, this.cubes)
    }, 100)
  }
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

