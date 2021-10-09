<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';">
  <div style="text-align:center;margin-top:1.5rem!important;margin-bottom:1.5rem!important;">
    <img src="https://ultrapacer.com/public/img/logo-128x128.png" style="width:128px;height:128px;">
    <p>
      Hello. You received the following message from <b>{{ name }}</b> regarding your {{ type }} <b>"{{ course }}"</b>.
      <br>
      Reply to this email (at {{ replyTo }}) to respond.
    </p>
    <div style="border: black; border-width: 1px; border-style: solid; padding: 10px; font-size: 1rem;">
      <pre><b>{{ message }}</b></pre>
    </div>
    <p v-if="url">
      <b-link :href="url">
        {{ url }}
      </b-link>
    </p>
  </div>
</div>
