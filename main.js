;(() => {

  sessionStorage.setItem('removed_nodes', '[]')

  function filterSponsored(node) {
    const sponsored = node.querySelector('.uiStreamSponsoredLink')
    if (sponsored) {
      remove(node)
    }
    return !!sponsored
  }

  function filterStranger(node) {
    const indirect = () => {
      let leaf = node.querySelector('h5')
      if (!leaf) {
        return false
      }
      while (leaf = leaf.parentNode) {
          if (leaf.classList.contains('userContentWrapper')) {
            return true
          } else if (leaf.classList.contains('clearfix')) {
            return false
          }
      }
    }
    const liked = () => !node.querySelector('.PageLikeButton')
    const friended = () => !node.querySelector('.FriendButton')
    const following = () => !node.querySelector('[ajaxify^="/ajax/follow"]')
    const stranger = !liked() || !friended() || !following() // || indirect()
    if (stranger) {
      remove(node)
    }
    return stranger
  }

  const filterWithNode = node => filterSponsored(node) || filterStranger(node)
  const filterWithPostContent = filterWithNode
  const filterWithComments = filterWithNode

  const onCommentListAdditions = mutations => filterWithComments(mutations[0].target)
  const onFeedStreamAdditions = mutations => {
    mutations.forEach(mutation => {
      Array.prototype.forEach.call(mutation.addedNodes, addedNode => {
        if (mutation.target.id && !mutation.target.id.indexOf('hyperfeed_story')) {
            filterWithPostContent(addedNode)
        } else if (addedNode.className && !addedNode.className.indexOf('UFIList')) {
            filterWithComments(addedNode)
            const commentListObserver = new MutationObserver(onCommentListAdditions)
            commentListObserver.observe(addedNode, { childList : true })
        }
      })
    })
  }

  const feedStreamObserver = new MutationObserver(onFeedStreamAdditions)
  const feedStream = document.querySelector('[id^=feed_stream]')
  feedStreamObserver.observe(feedStream, { childList: true, subtree : true })

  const posts = document.querySelectorAll('[id^=hyperfeed_story]')
  const filteredAll = Array.from(posts).map(filterWithNode).every(x => x)
  if (filteredAll) {
    document.body.scrollIntoView(false)
  }

  function remove(node) {
    const key = 'removed_nodes'
    const stored = JSON.parse(sessionStorage.getItem(key)) || []
    const contentBody = node.querySelector('.userContentWrapper .userContentWrapper[role=article] > div')
    const content = contentBody && contentBody.innerText
    if (content) {
      stored.push(content)
      sessionStorage.setItem(key, JSON.stringify(stored))
    }
    node.remove()
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'removed_nodes') {
      sendResponse(JSON.parse(sessionStorage.getItem('removed_nodes')) || [])
    }
  })

})();