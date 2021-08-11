<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';">
  <div style="text-align:center;margin-top:1.5rem!important;margin-bottom:1.5rem!important;">
    <img src="https://ultrapacer.com/public/img/logo-128x128.png" style="width:128px;height:128px;">
    <h1 style="margin-top:0;margin-bottom:.5rem;font-size: 3rem;font-weight:300;line-height:1.2;">
      Good luck this weekend!
    </h1>
    <p>
      You have {{ userplans.length === 1 ? 'a big plan' : 'some big plans' }} coming up:
    </p>
    <ul style="padding: 1em;margin-bottom: 0;">
      <li v-for="plan in userplans" style="font-size:1.25rem;font-weight:300;display:block;padding-top:.75rem;padding-bottom:.75rem;padding-right:1.25rem;padding-left:1.25rem;margin-bottom:-1px;border-width:1px;border-style:solid;border-color:rgba(0,0,0,.125);">
        <b style="font-weight:bolder;">{{ plan._course.name }}</b> on {{ plan.day }}
      </li>
    </ul>
    <a href="https://ultrapacer.com/courses" style="box-sizing:border-box;text-decoration:none;display:inline-block;font-weight:400;text-align:center;user-select:none;border-width:1px;border-style:solid;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color:#fff;background-color:#5e8351;border-color:#5e8351;padding-top:.5rem;padding-bottom:.5rem;padding-right:1rem;padding-left:1rem;font-size:1.25rem;line-height:1.5;border-radius:.3rem;margin-top: 1rem;" target="_blank">
      View your plans on ultraPacer
    </a>
  </div>
</div>
