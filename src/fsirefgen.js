"use strict";

(function() {
  // XXX navbar hack
  function navbarHack() { scrollBy(0, -40) }

  window.addEventListener("hashchange", navbarHack)

  function hop(op, k) {setTimeout(function() {op(k)}, 0)}
  function ignore() {}
  function queue(op) {hop(op, ignore)}

  function par() {
    var ops = Array.prototype.slice.call(arguments)
    return function(k) {
      var n = ops.length
      function co() {
        if (!--n)
          k()
      }
      if (!n) {
        k()
      } else {
        for (var i=0; i<ops.length; ++i)
          ops[i](co)
      }
    }
  }

  function seq() {
    var ops = Array.prototype.slice.call(arguments)
    return function(k) {
      var i = 0
      function lp() {
        if (i < ops.length)
          ops[i++](lp)
        else
          k()
      }
      lp()
    }
  }

  function loadScript(url) {
    return function(k) {
      var script = document.createElement("script")
      script.onload = k
      script.type = "text/javascript"
      script.src = url
      document.getElementsByTagName("head")[0].appendChild(script)
    }
  }

  function wrapWithSpan(elem) {
    var parent = elem.parentElement
    var span = document.createElement("span")
    parent.replaceChild(span, elem)
    span.appendChild(elem)
    return span
  }

  function descriptionOf(elem) {
    if (null === elem)
      return null
    if (elem.getAttribute("class") === "description")
      return elem
    return descriptionOf(elem.parentElement)
  }

  function removeIds(elem) {
    elem.removeAttribute("id")
    for (var i=0, n=elem.childElementCount; i < n; ++i)
      removeIds(elem.children[i])
  }

  var init = function(k) {
    $(document).ready(function() {
      navbarHack()

      $("code").each(function(i, block) {
        hljs.highlightBlock(block)
      })

      var tips = []

      $("a").each(function(i, link) {
        var href = link.getAttribute("href")

        if (href.indexOf("#def:") !== 0)
          return

        var target = document.getElementById(href.substring(1).replace(/%20/g, " "))
        if (!target)
          return

        var desc = descriptionOf(target)
        if (!desc ||
            !desc.children[0] ||
            !desc.children[0].children[0] ||
            !desc.children[1])
          return

        var code = desc.children[0].children[0].cloneNode(true)
        var p = desc.children[1].cloneNode(true)

        removeIds(code)
        removeIds(p)

        var tooltip = document.createElement("span")
        tooltip.setAttribute("class", "tooltip")

        tooltip.appendChild(code)
        tooltip.appendChild(p)

        tips.push({link: link, tooltip: tooltip})
      })

      tips.forEach(function (tip) {
        var span = wrapWithSpan(tip.link)
        span.setAttribute("class", "anchor")

        span.appendChild(tip.tooltip)
      })
    })
    k()
  }

  queue(seq(par(seq(loadScript("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.7.0/highlight.min.js"),
                    loadScript("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.7.0/languages/fsharp.min.js")),
                loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js")),
            init))
})()
