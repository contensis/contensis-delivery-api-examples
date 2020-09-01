import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { Client } from 'contensis-delivery-api';
import { ResponseContext } from 'contensis-core-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'angular-test-app';
  contensisProjectName = '';
  error = null;

  async ngOnInit(): Promise<void> {
    const client = Client.create({
      accessToken: 'xxxx',
      projectId: 'website',
      rootUrl: 'https://cms-example.cloud.contensis.com',
      defaultHeaders: { 'x-require-surrogate-key': 'true' },
      responseHandler: {
        ['*']: (response: Response, context: ResponseContext) => {
          if (response.url.endsWith('/nodes/root'))
            console.log('Repsonse:', response);
          response.headers.forEach((value, key) => {
            console.log('Response header:', key, ' -', value);
          });

          console.log('Response context:', context)
        }
      }
    });

    client.project.get().then(project => {
      this.contensisProjectName = project.name;
    },
      error => {
        this.error = error;
      }
    );

    let result = await client.nodes.getRoot();
    if (result) {
      console.log('Root node:', result);
    }
  }

}
