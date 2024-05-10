import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
export default {
  mounted(el) {
    if (el.textContent.trim() !== '') {
      hljs.highlightElement(el)
    }
  },
  updated(el) {
    if (el.textContent.trim() !== '') {
      hljs.highlightElement(el)
    }
  },
}
