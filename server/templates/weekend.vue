<div style="box-sizing:border-box;margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';font-size:1rem;font-weight:400;line-height:1.5;color:#212529;text-align:left;background-color:#fff;">
  <div class="mt-4 mb-4" style="box-sizing:border-box;align-items:center;justify-content:center;text-align:center;margin-top:1.5rem!important;margin-bottom:1.5rem!important;">
    <img src="https://ultrapacer.com/public/img/logo.png" style="box-sizing:border-box;width:128px;height:128px;vertical-align:middle;border-style:none;">
    <h1 style="box-sizing:border-box;margin-top:0;margin-bottom:.5rem;font-size:4.5rem;font-weight:300;line-height:1.2;">
      Good luck this weekend!
    </h1>
    <p class="lead pb-2">
      You have {{ userplans.length === 1 ? 'a big plan' : 'some big plans' }} coming up:
    </p>
    <ul  style="box-sizing:border-box;margin-top:0;display:flex;-ms-flex-direction:column;flex-direction:column; margin-bottom:0;">
      <li v-for="plan in userplans"  style="box-sizing:border-box;font-size:1.25rem;font-weight:300;position:relative;display:block;padding-top:.75rem;padding-bottom:.75rem;padding-right:1.25rem;padding-left:1.25rem;margin-bottom:-1px;background-color:#fff;border-width:1px;border-style:solid;border-color:rgba(0,0,0,.125);">
        <b style="box-sizing:border-box;font-weight:bolder;">{{ plan._course.name }}</b> on {{ plan.day }}
      </li>
    </ul>
    <a href="https://ultrapacer.com/courses" style="box-sizing:border-box;text-decoration:none;display:inline-block;font-weight:400;text-align:center;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-width:1px;border-style:solid;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color:#fff;background-color:#28a745;border-color:#28a745;padding-top:.5rem;padding-bottom:.5rem;padding-right:1rem;padding-left:1rem;font-size:1.25rem;line-height:1.5;border-radius:.3rem;margin-top:1.5rem!important;" target="_blank">
      View your plans on ultraPacer
    </a>
  </div>
</div>
