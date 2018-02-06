import './index.scss'
let disabledOP = ['=', 'C', 'del', '%'],
  displayBox = document.querySelector('.display'),
  btnList = document.querySelectorAll('.calc input[type="button"]'),
  computedBtn = document.querySelector('.computed'),
  clearBtn = document.querySelector('.clear'),
  delBtn = document.querySelector('.del'),
  operas = '',
  isComputed = false

// calc the publicity
// 12 3 4 + * 6 - 8 2 / +
// => 78
const calc = (publicity) => {
  let sum = 0
  let stack = publicity,
    opList = [['+', '-'], ['*', '/']],
    getOpPriority = (op) => {
      let i = -1
      for (let [index, value] of opList.entries()) {
        if ((Array.isArray(value) && value.indexOf(op) > -1) || value === op) {
          i = index
          break
        }
      }
      return i
    }

  let tmp = []
  while (stack.length !== 0) {
    let item = stack.shift()
    if (getOpPriority(item) > -1) {
      let op1 = tmp.pop()
      let op2 = tmp.pop()
      let result = 0
      switch (item) {
        case '+':
          result = op2 + op1
          break
        case '-':
          result = op2 - op1
          break
        case '*':
          result = op2 * op1
          break
        case '/':
          result = op2 / op1
        default: break
      }
      tmp.push(result)
    } else {
      tmp.push(parseFloat(item))
    }

  }
  return tmp[0]
}

// mid notation to last notation
// ['(', '12',+', '4', ')', '*', '5', '-', '6', '+', '8', '/', '2'] 
// => ['12', '3', '4', '+' ,'*', '6' ,'-', '8', '2' ,'/' ,'+']
const notation = (list) => {
  let output = [],
    opStack = [],
    opList = [['+', '-'], ['*', '/']],
    getOpPriority = (op) => {
      let i = -1
      for (let [index, value] of opList.entries()) {
        if ((Array.isArray(value) && value.indexOf(op) > -1) || value === op) {
          i = index
          break
        }
      }
      return i
    }

  if (!Array.isArray(list) || list.length === 0) return
  list.forEach(item => {
    if (/\d|\./.test(item)) {
      output.push(item)
    } else {
      if (getOpPriority(item) > -1) {
        if (opStack.length === 0 || getOpPriority(item) > getOpPriority(opStack[opStack.length - 1])) {
          opStack.push(item)
        } else {
          while (true) {
            let popOP = opStack.pop()
            output.push(popOP)
            opStack.push(item)
            if (opStack.length === 0 || getOpPriority(item) <= getOpPriority(opStack[opStack.length - 1])) {
              break
            }
          }
        }
      } else {
        if (item === ')') {
          while (true) {
            let popOP = opStack.pop()
            if (popOP !== '(') {
              output.push(popOP)
            } else {
              break
            }
          }
        } else {
          opStack.push(item)
        }
      }
    }
  })

  while (opStack.length != 0) {
    output.push(opStack.pop())
  }

  return output
}

// combine normalNumbers
// ['(', '1', '2' ,+', '4', ')', '*', '5', '-', '6', '+', '8', '/', '2']
// =>   ['(', '12',+', '4', ')', '*', '5', '-', '6', '+', '8', '/', '2']
const normalNumbers = (list) => {
  return list.match(/[^\d()]+|[\d.]+/g)
}

// numbers listener
Array.from(btnList).forEach(item => {
  item.addEventListener('click', e => {
    handlerNumber(e)
  })
})

// handlerNumber
const handlerNumber = (event) => {
  if (isComputed) {
    displayBox.innerHTML = ''
    isComputed = false
  }
  let op = event.target.value
  if (disabledOP.includes(op)) return
  displayBox.innerHTML += op
  operas += op
}

// computedBtn listener
computedBtn.addEventListener('click', e => {
  handleComputed()
})

const handleComputed = () => {
  displayBox.innerHTML = calc(notation(normalNumbers(operas)))
  isComputed = true
  operas = ''
}

// clear
clearBtn.addEventListener('click', e => {
  handleClear()
})

const handleClear = () => {
  displayBox.innerHTML = operas = ''
}

// del
delBtn.addEventListener('click', e => {
  displayBox.innerHTML = displayBox.innerHTML.substring(0, displayBox.innerHTML.length - 1)
  operas = operas.substring(1, operas.length - 1)
})
