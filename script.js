document.getElementById('analyzeBtn').addEventListener('click', function() {
    const userInput = document.getElementById('textAreaInput').value;
    const resultContainer = document.getElementById('analysisResult');
    const analysis = analyzeHTML(userInput);
    resultContainer.innerHTML = analysis.isValid ? 
        `<span class="successMsg">Код валідний! Використані правила:<br>${analysis.appliedRules.join('<br>')}</span>` : 
        `<span class="errorMsg">Код не валідний! Помилки:<br>${analysis.foundErrors.join('<br>')}</span>`;
});
function analyzeHTML(userInput) {
    const tagPattern = /<\/?([a-z1-6]{1,})\b([^>]*)?>/ig;
    let openTags = [];
    let tagMatch;
    let foundErrors = [];
    let appliedRules = [];
    const autoClosingTags = ['img', 'br', 'hr', 'meta', 'link', 'input', 'area', 'base', 'col', 'embed', 'keygen', 'param', 'source', 'track', 'wbr'];
    const nestingRules = {
        'h1': ['font', 'strong', 'em'],
        'h2': ['font', 'strong', 'em'],
        'h3': ['font', 'strong', 'em'],
        'h4': ['font', 'strong', 'em'],
        'h5': ['font', 'strong', 'em'],
        'h6': ['font', 'strong', 'em'],
        'p': ['strong', 'em', 'font', 'a', 'i']
    };
    while ((tagMatch = tagPattern.exec(userInput)) !== null) {
        const currentTag = tagMatch[1].toLowerCase();
        const isEndTag = tagMatch[0].startsWith('</');
        const tagAttributes = tagMatch[2] ? tagMatch[2].trim() : '';
        if (!isEndTag) {
            if (autoClosingTags.includes(currentTag)) {
                continue;
            }
            const validTags = ['html', 'head', 'title', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'div', 'span', 'a', 'img', 'strong', 'em', 'ul', 'li', 'ol', 'blockquote', 'table', 'tr', 'td', 'th', 'font', 'i', 'b'];
            if (!validTags.includes(currentTag)) {
                foundErrors.push(`Неправильний тег &lt;${currentTag}&gt; на позиції ${tagMatch.index}`);
                continue;
            }
            if (openTags.length > 0) {
                const parentTag = openTags[openTags.length - 1];
                if (nestingRules[parentTag] && !nestingRules[parentTag].includes(currentTag)) {
                    foundErrors.push(`Тег &lt;${currentTag}&gt; не може бути вкладеним у &lt;${parentTag}&gt; на позиції ${tagMatch.index}`);
                    continue;
                }
            }
            openTags.push(currentTag);
            appliedRules.push(`Тег &lt;${currentTag}&gt; правильний і доданий до стека.`);
        } else {
            if (openTags.length === 0 || openTags.pop() !== currentTag) {
                foundErrors.push(`Неправильний закритий тег &lt;/${currentTag}&gt; на позиції ${tagMatch.index}`);
            } else {
                appliedRules.push(`Тег &lt;/${currentTag}&gt; правильний і закриває тег &lt;${currentTag}&gt;.`);
            }
        }
        if (tagAttributes) {
            const attrPattern = /(\w+)\s*=\s*(['"])(.*?)\2/g;
            let attrMatch;

            while ((attrMatch = attrPattern.exec(tagAttributes)) !== null) {
                const attrName = attrMatch[1].toLowerCase();
                const validAttributes = ['src', 'href', 'alt', 'title', 'class', 'id', 'align', 'bgcolor', 'border', 'width', 'height', 'style', 'color', 'bordercolor'];

                if (!validAttributes.includes(attrName)) {
                    foundErrors.push(`Неправильний атрибут "${attrName}" у тегу &lt;${currentTag}&gt; на позиції ${tagMatch.index}`);
                }
            }
        }
    }
    if (openTags.length > 0) {
        foundErrors.push(`Не закриті теги: &lt;${openTags.join('&gt;, &lt;')}&gt;`);
    }
    return { isValid: foundErrors.length === 0, foundErrors, appliedRules };
}
