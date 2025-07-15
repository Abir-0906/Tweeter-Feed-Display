export const formatTweetText = (text) => {
  if (!text) return '';
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n/g, '<br />')
    .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
    .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
    .replace(
      /(^|\s)([A-Za-z]+:\/\/[^\s]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
    );
};
