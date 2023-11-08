#include<stdio.h>

double Res[256][256];

void toGLCM(int fromPicture[],int height,int width){
    double sum = height*(width-1);
    for(int i=0;i<height;i++){
        for(int j=0;j<width-1;j++){
            if(fromPicture[i*width+j]<fromPicture[i*width+j+1])
                Res[fromPicture[i*width+j]][fromPicture[i*width+j+1]]++;
            else
                Res[fromPicture[i*width+j+1]][fromPicture[i*width+j]]++;
        }
    }
    for(int i=0;i<256;i++){
        for(int j=0;j<256;j++){
            if(i > j)
                Res[i][j] = Res[j][i];
            else
                Res[i][j] /= sum;    
        } 
    }
}