chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  chrome.tabs.sendMessage(tabs[0].id, {type: 'removed_nodes'}, response => {
    if (!response) return
    document.getElementById('content').innerHTML = response
        .map(item => `<p>${item.replace(/\n/g, '<br>').trim()}</p>`)
        .join('')
  })
})